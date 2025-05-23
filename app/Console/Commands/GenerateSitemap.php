<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Accommodation;
use Carbon\Carbon;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate XML and HTML sitemaps for the website';

    public function handle()
    {
        $this->info('Generating sitemaps...');

        // Get all accommodations
        $accommodations = Accommodation::where('is_active', true)->get();
        $baseUrl = config('app.url');

        // Generate XML sitemap
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Add static pages
        $staticPages = [
            '/',
            '/accommodations',
            '/about',
            '/contact',
            '/terms',
            '/privacy',
            '/faq',
        ];

        foreach ($staticPages as $page) {
            $xml .= $this->generateUrlElement($baseUrl . $page);
        }

        // Add accommodation pages
        foreach ($accommodations as $accommodation) {
            $xml .= $this->generateUrlElement($baseUrl . '/accommodations/' . $accommodation->id);
        }

        $xml .= '</urlset>';

        // Save XML sitemap
        File::put(public_path('sitemap.xml'), $xml);

        // Generate HTML sitemap
        $html = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Map</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Site Map</h1>
        
        <h2>Main Pages</h2>
        <ul>';

        foreach ($staticPages as $page) {
            $html .= '<li><a href="' . $baseUrl . $page . '">' . ucfirst(trim($page, '/')) . '</a></li>';
        }

        $html .= '
        </ul>

        <h2>Accommodations</h2>
        <ul>';

        foreach ($accommodations as $accommodation) {
            $html .= '<li><a href="' . $baseUrl . '/accommodations/' . $accommodation->id . '">' . $accommodation->name . '</a></li>';
        }

        $html .= '
        </ul>
    </div>
</body>
</html>';

        // Save HTML sitemap
        File::put(public_path('sitemap.html'), $html);

        $this->info('Sitemaps generated successfully!');
        $this->info('XML sitemap: ' . public_path('sitemap.xml'));
        $this->info('HTML sitemap: ' . public_path('sitemap.html'));
    }

    private function generateUrlElement($url)
    {
        return '    <url>
        <loc>' . $url . '</loc>
        <lastmod>' . Carbon::now()->format('Y-m-d') . '</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>' . "\n";
    }
} 