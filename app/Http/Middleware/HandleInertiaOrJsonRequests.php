<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class HandleInertiaOrJsonRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the response
        $response = $next($request);
        
        // Log headers for debugging
        $headers = $request->headers->all();
        $headerString = json_encode($headers);
        Log::info("Request headers: {$headerString}");
        
        // Also log response headers and content type
        $respHeaders = $response->headers->all();
        $respHeaderString = json_encode($respHeaders);
        Log::info("Response headers: {$respHeaderString}");
        Log::info("Response content type: " . $response->headers->get('Content-Type'));
        
        // Check if this is an Inertia request
        $isInertia = $request->hasHeader('X-Inertia') || 
                     $request->header('Accept') === 'text/html, application/xhtml+xml' ||
                     (strpos($request->header('Accept'), 'application/json') !== false);
        
        // Try to determine if the response is JSON, regardless of Content-Type
        $content = $response->getContent();
        $isJsonResponse = false;
        
        if (is_string($content)) {
            // Attempt to decode as JSON
            Log::info("Response content: " . substr($content, 0, 200) . "...");
            
            if ($content && $content[0] === '{') {
                try {
                    $data = json_decode($content, true);
                    $isJsonResponse = json_last_error() === JSON_ERROR_NONE;
                    
                    if ($isJsonResponse) {
                        Log::info("Detected JSON response: " . json_encode($data));
                    } else {
                        Log::warning("Content looks like JSON but failed to parse: " . json_last_error_msg());
                    }
                } catch (\Exception $e) {
                    Log::warning("Exception parsing JSON: " . $e->getMessage());
                }
                
                // If we have valid JSON data and it's a success response
                if ($isJsonResponse && isset($data['success']) && $data['success'] === true) {
                    Log::info("Converting JSON response to redirect with flash message: " . ($data['message'] ?? 'Operation successful'));
                    
                    // Create a redirect response with flash data
                    return redirect()->back()->with('success', $data['message'] ?? 'Operation successful');
                }
            }
        }
        
        return $response;
    }
} 