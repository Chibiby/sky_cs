<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use Carbon\Carbon;

class SitemapController extends Controller
{
    public function generate()
    {
        $sitemap = Sitemap::create();
        $domain = 'https://skynaturepark.com';

        // Add main pages
        $sitemap->add(Url::create($domain . '/')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(1.0));
            
        $sitemap->add(Url::create($domain . '/dashboard')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
            ->setPriority(0.9));

        // Reservation pages
        $sitemap->add(Url::create($domain . '/reservations/create')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(0.8));
            
        $sitemap->add(Url::create($domain . '/reservations/manage')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
            ->setPriority(0.8));
            
        $sitemap->add(Url::create($domain . '/reservations/accommodation')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(0.7));
            
        $sitemap->add(Url::create($domain . '/reservations/booking-calendar')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(0.7));

        // Guest pages
        $sitemap->add(Url::create($domain . '/guests/manage')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(0.6));
            
        $sitemap->add(Url::create($domain . '/guests/history')
            ->setLastModificationDate(Carbon::yesterday())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(0.5));

        // User management pages (exclude from public sitemap as they're admin only)
        // $sitemap->add(Url::create($domain . '/users/manage'));
        // $sitemap->add(Url::create($domain . '/users/create'));

        // Write sitemap to public path
        $sitemap->writeToFile(public_path('sitemap.xml'));

        return redirect('/sitemap.xml')->with('success', 'Sitemap generated successfully!');
    }
}
