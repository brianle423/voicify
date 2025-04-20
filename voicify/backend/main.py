# backend/main.py

import os
import sys
import threading
import webbrowser
from wsgiref.simple_server import make_server
import inspect
import typing
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from starlette.types import Send, Receive, Scope, ASGIApp

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import from backend package
from backend.server import app

class ASGItoWSGIMiddleware:
    """
    Convert an ASGI application (like FastAPI) to a WSGI application,
    which can be run using Python's built-in WSGI server.
    """
    def __init__(self, asgi_app: ASGIApp):
        self.asgi_app = asgi_app

    def __call__(self, environ, start_response):
        """WSGI application callable"""
        # Create a new scope based on the WSGI environ
        path = environ.get('PATH_INFO', '')
        query_string = environ.get('QUERY_STRING', '').encode('ascii')
        
        # Convert WSGI environ to ASGI scope
        scope = {
            'type': 'http',
            'asgi': {'version': '3.0'},
            'http_version': environ.get('SERVER_PROTOCOL', 'HTTP/1.1').split('/')[-1],
            'method': environ.get('REQUEST_METHOD', 'GET'),
            'scheme': environ.get('wsgi.url_scheme', 'http'),
            'path': path,
            'raw_path': path.encode('utf-8'),
            'query_string': query_string,
            'headers': [
                (k.lower().replace('_', '-').encode('ascii'), 
                v.encode('ascii') if isinstance(v, str) else v)
                for k, v in environ.items()
                if k.startswith('HTTP_') or k in ('CONTENT_TYPE', 'CONTENT_LENGTH')
            ],
            'server': (environ.get('SERVER_NAME', ''), int(environ.get('SERVER_PORT', 0))),
            'client': (environ.get('REMOTE_ADDR', ''), int(environ.get('REMOTE_PORT', 0) or 0)),
        }

        # This is a simplified implementation that won't handle complex requests correctly
        # But it should work for basic API endpoints
        
        # For complex applications, a real ASGI<->WSGI adapter should be used
        body = environ.get('wsgi.input', None)
        body_bytes = body.read() if body else b''
        
        async def receive():
            return {
                'type': 'http.request',
                'body': body_bytes,
                'more_body': False,
            }
        
        response_status = [None]
        response_headers = [None]
        response_body = []
        
        async def send(message):
            if message['type'] == 'http.response.start':
                response_status[0] = message['status']
                response_headers[0] = message['headers']
            elif message['type'] == 'http.response.body':
                response_body.append(message.get('body', b''))
        
        # Run the ASGI app in a way that blocks until complete
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def run_app():
            await self.asgi_app(scope, receive, send)
        
        loop.run_until_complete(run_app())
        loop.close()
        
        # Convert ASGI response to WSGI response
        status = str(response_status[0]) + ' ' + {
            200: 'OK',
            201: 'Created',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            500: 'Internal Server Error',
        }.get(response_status[0], '')
        
        headers = []
        for name, value in response_headers[0]:
            if isinstance(name, bytes):
                name = name.decode('ascii')
            if isinstance(value, bytes):
                value = value.decode('ascii')
            headers.append((name, value))
        
        start_response(status, headers)
        return [b''.join(response_body)]

def run_server(host="localhost", port=8000):
    """Run the FastAPI app using a simple WSGI server"""
    # Convert FastAPI app to WSGI
    wsgi_app = ASGItoWSGIMiddleware(app)
    
    # Create a WSGI server
    with make_server(host, port, wsgi_app) as httpd:
        print(f"Starting ASL recognition server on http://{host}:{port}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Server stopping...")

if __name__ == "__main__":
    # Set host and port
    host = "localhost"  # or "0.0.0.0" to make it accessible from other devices
    port = 8000
    
    # Run the server
    run_server(host, port)