import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { useRef, useState, useEffect } from 'react';
import { format, parse, addDays } from 'date-fns';
import type { PageProps } from '@inertiajs/core';
import { ToastContainer, toast } from 'react-toastify';
import { Menu, Facebook, Instagram, Twitter, Phone, Mail, MapPin, ChevronRight, Plus, Minus, Waves, Mountain, Utensils, Bike, Wifi, Coffee, Dumbbell, Car, TreePine, UtensilsCrossed, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useBookingForm } from '@/hooks/useBookingForm';

interface User {
    id: number;
    name: string;
    email: string;
}

interface CustomPageProps extends PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
}

interface FAQItem {
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        question: "How can I make a reservation at the resort?",
        answer: "To make a reservation at our resort, simply fill out the booking form on our website with your desired dates and room preferences. Our team will get back to you to confirm your reservation."
    },
    {
        question: "What are the check-in and check-out times?",
        answer: "Check-in time is at 2:00 PM and check-out time is at 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability."
    },
    {
        question: "Do you offer airport transfers?",
        answer: "Yes, we provide airport transfer services for our guests. Please inform us of your flight details at least 48 hours before arrival to arrange your pickup."
    },
    {
        question: "What amenities are included with my stay?",
        answer: "All stays include access to our infinity pool, mountain view areas, fitness center, and complimentary Wi-Fi. Additional amenities vary by room type."
    },
    {
        question: "Is there a restaurant on-site?",
        answer: "Yes, we have an on-site restaurant serving local and international cuisine. We also offer room service during operating hours."
    },
    {
        question: "What is your cancellation policy?",
        answer: "Reservations can be cancelled up to 48 hours before check-in for a full refund. Cancellations made within 48 hours of check-in may be subject to a fee."
    }
];

// Add this function at the top level, outside of any component
const handleDirectJsonResponse = () => {
    // Check if we have a JSON response message in the DOM
    const jsonResponseElement = document.querySelector('.inertia-error');
    if (jsonResponseElement) {
        try {
            const jsonText = jsonResponseElement.textContent || '';
            console.log("Found JSON text:", jsonText);
            
            // Try to parse JSON from the error message
            const match = jsonText.match(/\{.*\}/);
            if (match) {
                const jsonData = JSON.parse(match[0]);
                console.log("Parsed JSON data:", jsonData);
                
                if (jsonData.success === true) {
                    // Hide the JSON error message immediately
                    (jsonResponseElement as HTMLElement).style.display = 'none';
                    document.body.classList.add('show-booking-confirmation');
                    
                    // Store the success data in sessionStorage for the component to use
                    sessionStorage.setItem('booking_success', JSON.stringify({
                        message: jsonData.message,
                        reservation_id: jsonData.reservation_id
                    }));
                    
                    return true;
                }
            }
        } catch (e) {
            console.error("Error handling JSON response:", e);
        }
    }
    return false;
};

// Try to handle JSON response immediately when the script loads
if (typeof document !== 'undefined') {
    // Execute after a small delay to ensure the DOM is ready
    setTimeout(handleDirectJsonResponse, 100);
}

export default function Welcome({ auth, flash }: CustomPageProps) {
    const [showBookingForm, setShowBookingForm] = useState(false);
    const bookingFormRef = useRef<HTMLDivElement>(null);
    const [roomType, setRoomType] = useState<string>('');
    const [numberOfGuests, setNumberOfGuests] = useState<string>('');
    const [expandedFAQs, setExpandedFAQs] = useState<number[]>([]);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [visibleSections, setVisibleSections] = useState<string[]>([]);
    const [scrollPosition, setScrollPosition] = useState<{ [key: string]: number }>({});
    const [sheetOpen, setSheetOpen] = useState(false);
    const [showAllFAQs, setShowAllFAQs] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
    const [showBookingConfirmation, setShowBookingConfirmation] = useState<boolean>(false);

    // Replace form-related state and hooks with useBookingForm
    const {
        data,
        setData,
        errors,
        setError,
        clearErrors,
        reset,  // Make sure we include reset here
        isSubmitting,
        setIsSubmitting,
        showConfirmDialog,
        setShowConfirmDialog,
        bookingData,
        setBookingData,
        validateField,
        handleInputChange,
        handleSubmit: originalHandleSubmit,
        handleConfirmBooking,
        handleCancelBooking,
        submitRequest,
        roomTypes,
        availableRoomNumbers,
        isLoadingRooms
    } = useBookingForm();
    
    // Override the handleSubmit function to never show confirmation
    const handleSubmit = (e: React.FormEvent) => {
        originalHandleSubmit(e, false);
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string, closeMenu: boolean = false) => {
        e.preventDefault();
        
        if (closeMenu) {
            setSheetOpen(false);
        }
        
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                const offset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }, closeMenu ? 300 : 0);
    };

    useEffect(() => {
        // Start animation sequence without setting isLoaded state
        console.log("1. Starting animation sequence...");
        
        // Give browser a moment to render the initial state
        setTimeout(() => {
            // Step 1: Animate hero title
            console.log("1. Animating hero title...");
                const heroTitle = document.querySelector('.hero-title');
                if (heroTitle) {
                    heroTitle.classList.add('animate');
                }
                
            // Step 2: Animate hero description
                setTimeout(() => {
                console.log("2. Animating hero description...");
                    const heroDescription = document.querySelector('.hero-description');
                    if (heroDescription) {
                        heroDescription.classList.add('animate');
                    }
                    
                // Step 3: Animate CTA button
                    setTimeout(() => {
                    console.log("3. Animating CTA button...");
                        const heroButton = document.querySelector('.hero-button');
                        if (heroButton) {
                            heroButton.classList.add('animate');
                    }
                    
                    // Step 4: Load and animate the hero image
                    setTimeout(() => {
                        console.log("4. Loading and animating hero image...");
                        const heroImage = document.querySelector('.hero-image');
                        if (heroImage) {
                            heroImage.classList.add('animate');
                        }
                        
                        // Step 5: Animate header container (make it visible without sliding)
                        setTimeout(() => {
                            console.log("5. Showing header container...");
                            const headerContainer = document.querySelector('.header-container');
                            if (headerContainer) {
                                headerContainer.classList.add('animate');
                            }
                            
                            // Step 6: Animate header logo
                            setTimeout(() => {
                                console.log("6. Animating header logo...");
                                const headerLogo = document.querySelector('.header-logo');
                                if (headerLogo) {
                                    headerLogo.classList.add('animate');
                                }
                                
                                // Step 7: Animate navigation
                                setTimeout(() => {
                                    console.log("7. Animating navigation...");
                                    const headerNav = document.querySelector('.header-nav');
                                    if (headerNav) {
                                        headerNav.classList.add('animate');
                                    }
                                    
                                    // Step 8: Animate login button
                                    setTimeout(() => {
                                        console.log("8. Animating login button...");
                                        const headerButton = document.querySelector('.header-button');
                                        if (headerButton) {
                                            headerButton.classList.add('animate');
                                        }
                                    }, 300);
                                }, 300);
                            }, 500);
                        }, 500);
                    }, 800); // Increased delay for hero image to ensure text is visible first
                    }, 400);
                }, 400);
        }, 300);

        // Store last scroll position to determine scroll direction
        let lastScrollY = window.scrollY;

        // Function to determine scroll direction
        const getScrollDirection = () => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY ? "down" : "up";
            lastScrollY = scrollY;
            return direction;
        };

        // Add the IntersectionObserver for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Add to visible sections when scrolling into view
                        setVisibleSections(prev => {
                            if (!prev.includes(entry.target.id)) {
                                return [...prev, entry.target.id];
                            }
                            return prev;
                        });
                    }
                });
            },
            {
                root: null,
                rootMargin: '-10%', // 10% margin to trigger animations slightly before section is fully visible
                threshold: 0.1 // Trigger when at least 10% of the element is visible
            }
        );

        document.querySelectorAll('[data-animate]').forEach((section) => {
            observer.observe(section);
        });

        return () => {
            observer.disconnect();
        };
    }, [showAllFAQs]);

    useEffect(() => {
        // Scroll to top when the component mounts (page loads/refreshes)
        window.scrollTo(0, 0);
        
        // Reset scroll position in browser history to prevent some browsers from restoring scroll
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Set a key in session storage to detect page refreshes
        const refreshKey = 'page_was_refreshed';
        
        if (sessionStorage.getItem(refreshKey)) {
            // Page was refreshed - ensure we're at the top and reset all animations
            window.scrollTo(0, 0);
            
            // Reset all animations by removing animate classes
            document.querySelectorAll('.animate').forEach(element => {
                element.classList.remove('animate');
            });
            
            // Remove the flag after handling
            sessionStorage.removeItem(refreshKey);
        }
        
        const handleBeforeUnload = () => {
            // Set flag before refresh/unload
            sessionStorage.setItem(refreshKey, 'true');
            // Force scroll to top as a hint for browsers
            window.scrollTo(0, 0);
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const shouldAnimate = (sectionId: string) => {
        return visibleSections.includes(sectionId);
    };

    useEffect(() => {
        // Check for success data in sessionStorage (from handleDirectJsonResponse)
        try {
            const storedSuccess = sessionStorage.getItem('booking_success');
            if (storedSuccess) {
                console.log("Found stored booking success data");
                
                // Show confirmation dialog
                setShowBookingConfirmation(true);
                
                // Reset form
                reset();
                setData('room_type', '');
                setData('number_of_guests', '');
                
                // Clear the stored data
                sessionStorage.removeItem('booking_success');
                
                // Also remove the show-booking-confirmation class from body if it exists
                document.body.classList.remove('show-booking-confirmation');
                
                // Check if we have a JSON error element and hide it
                const jsonElement = document.querySelector('.inertia-error');
                if (jsonElement) {
                    (jsonElement as HTMLElement).style.display = 'none';
                }
                
                return; // Exit early - we've handled the success
            }
        } catch (e) {
            console.error("Error checking sessionStorage:", e);
        }
        
        // Add a function to directly detect and handle JSON responses
        const handleDirectResponse = () => {
            // Check if we have a JSON response message in the DOM
            const jsonResponseElement = document.querySelector('.inertia-error');
            if (jsonResponseElement) {
                try {
                    const jsonText = jsonResponseElement.textContent || '';
                    // Try to parse JSON from the error message
                    const match = jsonText.match(/\{.*\}/);
                    if (match) {
                        const jsonData = JSON.parse(match[0]);
                        if (jsonData.success === true) {
                            console.log("Found success JSON response:", jsonData);
                            // Show confirmation modal
                            setShowBookingConfirmation(true);
                            // Reset form
                            reset();
                            setData('room_type', '');
                            setData('number_of_guests', '');
                            // Hide the JSON error message
                            (jsonResponseElement as HTMLElement).style.display = 'none';
                            return true;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                }
            }
            return false;
        };
        
        // Try to handle direct JSON response immediately
        if (!handleDirectResponse()) {
            console.log("No direct JSON response found, checking flash data");
            
            // Check for flash messages (from redirects)
            console.log("Flash data:", flash);
            
            if (flash?.success) {
                console.log("Success flash detected:", flash.success);
                // Show our custom confirmation popup instead of toast
                setShowBookingConfirmation(true);
                // Use reset from useBookingForm
                reset();
                // Set form fields directly
                setData('room_type', '');
                setData('number_of_guests', '');
            }
            
            if (flash?.error) {
                console.log("Error flash detected:", flash.error);
                toast.error(flash.error, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { zIndex: 9999 }
                });
            }
        }
        
        // Add event listener for custom booking:success event
        const handleBookingSuccess = (event: CustomEvent) => {
            console.log("Custom booking success event:", event.detail);
            setShowBookingConfirmation(true);
            reset();
            setData('room_type', '');
            setData('number_of_guests', '');
        };
        
        window.addEventListener('booking:success', handleBookingSuccess as EventListener);
        
        return () => {
            window.removeEventListener('booking:success', handleBookingSuccess as EventListener);
        };
    }, [flash?.success, flash?.error]);

    const scrollToBooking = () => {
        setShowBookingForm(true);
        setTimeout(() => {
            const element = bookingFormRef.current;
            if (element) {
                const offset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }, 100);
    };

    const roomTypesWithIds = [
        { id: 15, name: 'Cabin 1', category: 'Cabin' },
        { id: 16, name: 'Cabin 2', category: 'Cabin' },
        { id: 17, name: 'Cabin 3', category: 'Cabin' },
        { id: 18, name: 'Cabin 4', category: 'Cabin' },
        { id: 19, name: 'Cabin 5', category: 'Cabin' },
        { id: 20, name: 'Cabin 6', category: 'Cabin' },
        { id: 21, name: 'Cabin 7', category: 'Cabin' },
        { id: 22, name: 'Cabin 8', category: 'Cabin' },
        { id: 6, name: 'Cottage 1', category: 'Cottage' },
        { id: 7, name: 'Cottage 2', category: 'Cottage' },
        { id: 8, name: 'Cottage 3', category: 'Cottage' },
        { id: 9, name: 'Cottage 4', category: 'Cottage' },
        { id: 10, name: 'Cottage 5', category: 'Cottage' },
        { id: 11, name: 'Cottage 6', category: 'Cottage' },
        { id: 12, name: 'Cottage 7', category: 'Cottage' },
        { id: 13, name: 'Cottage 8', category: 'Cottage' },
        { id: 14, name: 'Cottage 9', category: 'Cottage' },
        { id: 1, name: 'Villa 1', category: 'Villa' },
        { id: 2, name: 'Villa 2', category: 'Villa' },
        { id: 3, name: 'Villa 3', category: 'Villa' },
        { id: 4, name: 'Villa 4', category: 'Villa' },
        { id: 5, name: 'Villa 5', category: 'Villa' }
    ];

    useEffect(() => {
        // Watch for visibility change of the about section
        const handleVisibilityChange = () => {
            if (visibleSections.includes('about-section')) {
                console.log("About section is visible, starting animations");
                
                // Animation sequence for about section elements
                const aboutTitle = document.querySelector('.about-title');
                if (aboutTitle) {
                    aboutTitle.classList.add('animate');
                    
                    // Then animate description after 500ms
                    setTimeout(() => {
                        const aboutDescription = document.querySelector('.about-description');
                        if (aboutDescription) {
                            aboutDescription.classList.add('animate');
                            
                            // Then animate stat 1 after 500ms
                            setTimeout(() => {
                                const aboutStat1 = document.querySelector('.about-stat-1');
                                if (aboutStat1) {
                                    aboutStat1.classList.add('animate');
                                    
                                    // Then animate stat 2 after 300ms
                                    setTimeout(() => {
                                        const aboutStat2 = document.querySelector('.about-stat-2');
                                        if (aboutStat2) {
                                            aboutStat2.classList.add('animate');
                                            
                                            // Then animate stat 3 after 300ms
                                            setTimeout(() => {
                                                const aboutStat3 = document.querySelector('.about-stat-3');
                                                if (aboutStat3) {
                                                    aboutStat3.classList.add('animate');
                                                }
                                            }, 300);
                                        }
                                    }, 300);
                                }
                            }, 500);
                        }
                    }, 500);
                }
            }
        };

        // Call once to check if section is already visible
        handleVisibilityChange();
        
        // Setup listener for future changes
        const prevVisibleSections = [...visibleSections];
        return () => {
            if (JSON.stringify(prevVisibleSections) !== JSON.stringify(visibleSections)) {
                handleVisibilityChange();
            }
        };
    }, [visibleSections]);

    useEffect(() => {
        // Watch for visibility change of the accommodations section
        const handleAccommodationsVisibility = () => {
            if (visibleSections.includes('accommodations-section')) {
                console.log("Accommodations section is visible, starting animations");
                
                // Animation sequence for accommodations section elements
                const accommodationsTitle = document.querySelector('.accommodations-title');
                if (accommodationsTitle) {
                    accommodationsTitle.classList.add('animate');
                    
                    // Then animate villa card after 500ms
                    setTimeout(() => {
                        const villaCard = document.querySelector('.accommodation-card-1');
                        if (villaCard) {
                            villaCard.classList.add('animate');
                            
                            // Then animate cabin card after 300ms
                            setTimeout(() => {
                                const cabinCard = document.querySelector('.accommodation-card-2');
                                if (cabinCard) {
                                    cabinCard.classList.add('animate');
                                    
                                    // Then animate cottage card after 300ms
                                    setTimeout(() => {
                                        const cottageCard = document.querySelector('.accommodation-card-3');
                                        if (cottageCard) {
                                            cottageCard.classList.add('animate');
                                        }
                                    }, 300);
                                }
                            }, 300);
                        }
                    }, 500);
                }
            }
        };

        // Call once to check if section is already visible
        handleAccommodationsVisibility();
        
        // Setup listener for future changes
        return () => {
            if (visibleSections.includes('accommodations-section')) {
                handleAccommodationsVisibility();
            }
        };
    }, [visibleSections]);

    useEffect(() => {
        // Watch for visibility change of the amenities section
        const handleAmenitiesVisibility = () => {
            if (visibleSections.includes('amenities-section')) {
                console.log("Amenities section is visible, starting animations");
                
                // Animation sequence for amenities section elements
                const amenitiesTitle = document.querySelector('.amenities-title');
                if (amenitiesTitle) {
                    amenitiesTitle.classList.add('animate');
                    
                    // Then animate the amenity items one by one with a delay between each
                    const animateAmenityWithDelay = (index: number, delay: number) => {
                        setTimeout(() => {
                            const amenityItem = document.querySelector(`.amenity-item-${index}`);
                            if (amenityItem) {
                                amenityItem.classList.add('animate');
                            }
                        }, delay);
                    };
                    
                    // Set up sequential animation for the initial 4 amenities
                    animateAmenityWithDelay(1, 400); // Infinity Pool
                    animateAmenityWithDelay(2, 600); // Mountain Views
                    animateAmenityWithDelay(3, 800); // BBQ Area
                    animateAmenityWithDelay(4, 1000); // Nature Trails
                    
                    // If the "show more" amenities are visible, animate them too
                    if (showAllAmenities) {
                        animateAmenityWithDelay(5, 1200); // WiFi
                        animateAmenityWithDelay(6, 1400); // Café & Restaurant
                        animateAmenityWithDelay(7, 1600); // Fitness Center
                        animateAmenityWithDelay(8, 1800); // Free Parking
                    }
                }
            }
        };

        // Call once to check if section is already visible
        handleAmenitiesVisibility();
        
        // Setup listener for future changes
        return () => {
            if (visibleSections.includes('amenities-section')) {
                handleAmenitiesVisibility();
            }
        };
    }, [visibleSections, showAllAmenities]);

    // New effect to handle immediate animation of expanded amenities
    useEffect(() => {
        // Only run this when showAllAmenities becomes true and the amenities section is visible
        if (showAllAmenities && visibleSections.includes('amenities-section')) {
            console.log("Animating additional amenities after expansion");
            
            // Animate additional amenities immediately with shorter delays
            const animateAmenityWithDelay = (index: number, delay: number) => {
                setTimeout(() => {
                    const amenityItem = document.querySelector(`.amenity-item-${index}`);
                    if (amenityItem) {
                        amenityItem.classList.add('animate');
                    }
                }, delay);
            };
            
            // Use shorter delays for better response after click
            animateAmenityWithDelay(5, 100); // WiFi
            animateAmenityWithDelay(6, 200); // Café & Restaurant
            animateAmenityWithDelay(7, 300); // Fitness Center
            animateAmenityWithDelay(8, 400); // Free Parking
        }
    }, [showAllAmenities, visibleSections]);

    useEffect(() => {
        // Watch for visibility change of the contact section
        const handleContactVisibility = () => {
            if (visibleSections.includes('contact-section')) {
                console.log("Contact section is visible, starting animations");
                
                // Animation sequence for contact section elements
                const contactTitle = document.querySelector('.contact-title');
                if (contactTitle) {
                    contactTitle.classList.add('animate');
                    
                    // Then animate phone info after 400ms
                    setTimeout(() => {
                        const phoneInfo = document.querySelector('.contact-info-1');
                        if (phoneInfo) {
                            phoneInfo.classList.add('animate');
                            
                            // Then animate email info after 300ms
                            setTimeout(() => {
                                const emailInfo = document.querySelector('.contact-info-2');
                                if (emailInfo) {
                                    emailInfo.classList.add('animate');
                                    
                                    // Then animate location info after 300ms
                                    setTimeout(() => {
                                        const locationInfo = document.querySelector('.contact-info-3');
                                        if (locationInfo) {
                                            locationInfo.classList.add('animate');
                                            
                                            // Finally animate contact form after 300ms
                                            setTimeout(() => {
                                                const contactForm = document.querySelector('.contact-form');
                                                if (contactForm) {
                                                    contactForm.classList.add('animate');
                                                }
                                            }, 300);
                                        }
                                    }, 300);
                                }
                            }, 300);
                        }
                    }, 400);
                }
            }
        };

        // Call once to check if section is already visible
        handleContactVisibility();
        
        // Setup listener for future changes
        return () => {
            if (visibleSections.includes('contact-section')) {
                handleContactVisibility();
            }
        };
    }, [visibleSections]);

    useEffect(() => {
        // Watch for visibility change of the FAQ section
        const handleFAQVisibility = () => {
            if (visibleSections.includes('faq-section')) {
                console.log("FAQ section is visible, starting animations");
                
                // Animation sequence for FAQ section elements
                const faqTitle = document.querySelector('.faq-title');
                if (faqTitle) {
                    faqTitle.classList.add('animate');
                    
                    // Then animate each FAQ item in sequence
                    const animateFAQWithDelay = (index: number, delay: number) => {
                        setTimeout(() => {
                            const faqItem = document.querySelector(`.faq-item-${index}`);
                            if (faqItem) {
                                faqItem.classList.add('animate');
                            }
                        }, delay);
                    };
                    
                    // Animate visible FAQs
                    const visibleCount = showAllFAQs ? faqItems.length : 2;
                    for (let i = 0; i < visibleCount; i++) {
                        animateFAQWithDelay(i, 400 + (i * 200));
                    }
                    
                    // Then animate the "show more" button
                    setTimeout(() => {
                        const moreButton = document.querySelector('.faq-more-button');
                        if (moreButton) {
                            moreButton.classList.add('animate');
                        }
                    }, 400 + (2 * 200) + 200);
                }
            }
        };

        // Call once to check if section is already visible
        handleFAQVisibility();
        
        // Setup listener for future changes
        return () => {
            if (visibleSections.includes('faq-section')) {
                handleFAQVisibility();
            }
        };
    }, [visibleSections, showAllFAQs]);

    // Add this helper function to animate FAQ items with delay
    const animateFAQWithDelay = (element: HTMLElement | null, delay: number) => {
        if (!element) return;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.visibility = 'visible';
        }, delay);
    };

    // Add a proper logout handler using Inertia router
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(route('logout'), {});
    };

    const toggleFAQ = (index: number) => {
        setExpandedFAQs((prev: number[]) => 
            prev.includes(index) 
                ? prev.filter((i: number) => i !== index)
                : [...prev, index]
        );
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{`
                    @media (max-width: 1000px) {
                        .xl\\:hidden { display: block; }
                        .xl\\:flex { display: none !important; }
                        .xl\\:block { display: none !important; }
                    }
                    @media (min-width: 1001px) {
                        .xl\\:hidden { display: none; }
                        .xl\\:flex { display: flex !important; }
                        .xl\\:block { display: block !important; }
                    }
                    
                    /* Hide JSON error when booking confirmation is shown */
                    body.show-booking-confirmation .inertia-error {
                        display: none !important;
                    }
                    
                    /* Base animation classes - hidden by default */
                    .hero-image {
                        opacity: 0;
                        transition: opacity 1.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .hero-image.animate {
                        opacity: 1;
                        visibility: visible;
                    }
                    
                    .header-container {
                        opacity: 0;
                        visibility: hidden;
                    }
                    
                    .header-container.animate {
                        opacity: 1;
                        visibility: visible;
                        transition: opacity 0.8s ease-out;
                    }
                    
                    /* Make mobile navigation visible immediately */
                    .xl\\:hidden.header-button {
                        opacity: 1 !important;
                        visibility: visible !important;
                        transform: translateY(0) !important;
                    }
                    
                    .hero-title {
                        opacity: 0;
                        transform: translateY(-40px);
                        transition: opacity 1s ease-out, transform 1s ease-out;
                        visibility: hidden;
                    }
                    
                    .hero-title.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .hero-description {
                            opacity: 0;
                        transition: opacity 1s ease-out;
                        visibility: hidden;
                        }
                    
                    .hero-description.animate {
                            opacity: 1;
                        visibility: visible;
                    }
                    
                    .hero-button {
                            opacity: 0;
                        transform: scale(0.9);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                        }
                    
                    .hero-button.animate {
                            opacity: 1;
                        transform: scale(1);
                        visibility: visible;
                    }
                    
                    .header-logo {
                            opacity: 0;
                            transform: translateY(-20px);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                        }
                    
                    .header-logo.animate {
                            opacity: 1;
                            transform: translateY(0);
                        visibility: visible;
                        }
                    
                    .header-nav {
                            opacity: 0;
                            transform: translateY(-20px);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                        }
                    
                    .header-nav.animate {
                            opacity: 1;
                            transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .header-button {
                        opacity: 0;
                        transform: translateY(-20px);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                    }
                    
                    .header-button.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    /* Scroll animation classes */
                    .scroll-animation {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        will-change: opacity, transform;
                    }
                    .scroll-animation.animate {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .delay-100 { transition-delay: 100ms; }
                    .delay-200 { transition-delay: 200ms; }
                    .delay-300 { transition-delay: 300ms; }
                    .delay-400 { transition-delay: 400ms; }
                    
                    /* About section animation classes */
                    .about-title {
                        opacity: 0;
                        transform: translateY(-20px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .about-title.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .about-description {
                        opacity: 0;
                        transition: opacity 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .about-description.animate {
                        opacity: 1;
                        visibility: visible;
                    }
                    
                    .about-stat {
                        opacity: 0;
                        transform: scale(0.9);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                    }
                    
                    .about-stat.animate {
                        opacity: 1;
                        transform: scale(1);
                        visibility: visible;
                    }
                    
                    /* Accommodations section animation classes */
                    .accommodations-title {
                        opacity: 0;
                        transform: translateY(-20px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .accommodations-title.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .accommodation-card {
                            opacity: 0;
                            transform: translateY(30px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                        }
                    
                    .accommodation-card.animate {
                            opacity: 1;
                            transform: translateY(0);
                        visibility: visible;
                    }
                    
                    /* Amenities section animation classes */
                    .amenities-title {
                        opacity: 0;
                        transform: translateY(-20px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .amenities-title.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .amenity-item {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .amenity-item.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    /* Contact section animation classes */
                    .contact-title {
                            opacity: 0;
                            transform: translateY(-20px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                        }
                    
                    .contact-title.animate {
                            opacity: 1;
                            transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .contact-info {
                        opacity: 0;
                        transform: translateX(-20px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .contact-info.animate {
                        opacity: 1;
                        transform: translateX(0);
                        visibility: visible;
                    }
                    
                    .contact-form {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .contact-form.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    /* FAQ section animation classes */
                    .faq-title {
                        opacity: 0;
                        transform: translateY(-20px);
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                        visibility: hidden;
                    }
                    
                    .faq-title.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .faq-item {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                    }
                    
                    .faq-item.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                    
                    .faq-more-button {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
                        visibility: hidden;
                    }
                    
                    .faq-more-button.animate {
                        opacity: 1;
                        transform: translateY(0);
                        visibility: visible;
                    }
                `}</style>
            </Head>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 9999 }}
            />
            <div className="relative min-h-screen flex flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <header className="fixed top-0 left-0 w-full z-50 header-container">
                    <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-sm transition-all duration-300"></div>
                    <nav className="relative mx-auto flex justify-between items-center px-4 sm:px-[120px] h-[70px]">
                        <div className="flex-shrink-0 header-logo">
                            <img src="/favicon.svg" alt="Sky Nature Park Logo" className="h-6 w-auto" />
                        </div>
                        
                        <div className="hidden xl:flex items-center justify-center space-x-4 2xl:space-x-8 header-nav">
                                <a 
                                    href="#about-section" 
                                    onClick={(e) => scrollToSection(e, 'about-section')}
                                className="text-[#2c5266] hover:text-[#47859e] transition-colors px-2 whitespace-nowrap text-sm text-center"
                                >
                                    About
                                </a>
                                <a 
                                    href="#accommodations-section" 
                                    onClick={(e) => scrollToSection(e, 'accommodations-section')}
                                className="text-[#2c5266] hover:text-[#47859e] transition-colors px-2 whitespace-nowrap text-sm text-center"
                                >
                                    Accommodations
                                </a>
                                <a 
                                    href="#amenities-section" 
                                    onClick={(e) => scrollToSection(e, 'amenities-section')}
                                className="text-[#2c5266] hover:text-[#47859e] transition-colors px-2 whitespace-nowrap text-sm text-center"
                                >
                                    Amenities
                                </a>
                                <a 
                                    href="#contact-section" 
                                    onClick={(e) => scrollToSection(e, 'contact-section')}
                                className="text-[#2c5266] hover:text-[#47859e] transition-colors px-2 whitespace-nowrap text-sm text-center"
                                >
                                    Contact
                                </a>
                        </div>
                        
                        <div className="hidden xl:block flex-shrink-0 header-button">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center rounded-full bg-[#47859e] px-6 py-2 text-sm font-medium text-white hover:bg-[#3a7186] transition-colors h-[38px]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center rounded-full border border-[#47859e] px-6 py-2 text-sm font-medium text-[#47859e] hover:bg-[#47859e]/10 transition-colors h-[38px]"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                        
                        <div className="xl:hidden">
                            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2c5266]">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-64">
                                    <div className="flex flex-col items-center pt-12">
                                        <div className="flex flex-col items-center gap-6 py-4 text-center">
                                            <a 
                                                href="#about-section" 
                                                onClick={(e) => scrollToSection(e, 'about-section', true)}
                                                className="text-[#2c5266] hover:text-[#47859e] transition-colors text-lg"
                                            >
                                                About
                                            </a>
                                            <a 
                                                href="#accommodations-section" 
                                                onClick={(e) => scrollToSection(e, 'accommodations-section', true)}
                                                className="text-[#2c5266] hover:text-[#47859e] transition-colors text-lg"
                                            >
                                                Accommodations
                                            </a>
                                            <a 
                                                href="#amenities-section" 
                                                onClick={(e) => scrollToSection(e, 'amenities-section', true)}
                                                className="text-[#2c5266] hover:text-[#47859e] transition-colors text-lg"
                                            >
                                                Amenities
                                            </a>
                                            <a 
                                                href="#contact-section" 
                                                onClick={(e) => scrollToSection(e, 'contact-section', true)}
                                                className="text-[#2c5266] hover:text-[#47859e] transition-colors text-lg"
                                            >
                                                Contact
                                            </a>
                                        </div>
                                        
                                        <div className="mt-6">
                                        {auth.user ? (
                                            <Link
                                                href={route('dashboard')}
                                                    className="inline-flex items-center justify-center rounded-full bg-[#47859e] px-6 py-2 text-sm font-medium text-white hover:bg-[#3a7186] transition-colors"
                                            >
                                                Dashboard
                                            </Link>
                                        ) : (
                                                <Link
                                                    href={route('login')}
                                                    className="inline-flex items-center justify-center rounded-full border border-[#47859e] px-6 py-2 text-sm font-medium text-[#47859e] hover:bg-[#47859e]/10 transition-colors"
                                                >
                                                    Login
                                                </Link>
                                        )}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </nav>
                </header>

                <section className="relative min-h-screen py-20">
                    <div className="relative mx-auto px-4 sm:px-[120px] h-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-160px)]">
                            {/* Right side - Image (moved up in mobile) */}
                            <div className="relative w-full aspect-[4/3] lg:aspect-[16/10] order-1 lg:order-2">
                        <img 
                            src="/images/pexels-pixabay-221457.jpg"
                            alt="Infinity pool with mountain view" 
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg hero-image"
                        />
                    </div>
                            
                            {/* Left side - Text content */}
                            <div className="z-10 max-w-xl pt-8 lg:pt-0 order-2 lg:order-1">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 hero-title">
                                    <span className="text-gray-800">Welcome to</span>{' '}
                                    <span className="text-[#47859e] whitespace-nowrap">Sky Nature Park</span>
                                </h1>
                                <p className="text-lg sm:text-xl mb-8 text-gray-600 hero-description">
                                    Your perfect mountain getaway destination
                                </p>
                            <button
                                onClick={scrollToBooking}
                                    className="inline-block rounded-full bg-[#47859e] px-8 py-3 text-lg font-medium text-white hover:bg-[#3a7186] transition-colors hero-button"
                            >
                                    Book Your Stay
                            </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                    id="about-section"
                    data-animate
                    className={`py-20 bg-white scroll-animation ${
                        shouldAnimate('about-section') ? 'animate delay-200' : ''
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-[#47859e] mb-4 about-title">Discover Our Paradise</h2>
                            <p className="text-gray-600 text-lg about-description">
                                Nestled in the heart of nature, Sky Nature Park offers a perfect blend of comfort and adventure.
                                Experience breathtaking views, luxurious accommodations, and unforgettable moments in our mountain retreat.
                                Our resort combines modern amenities with natural beauty to create an exceptional stay for our guests.
                            </p>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 about-stat about-stat-1">
                                    <div className="text-3xl font-bold text-[#47859e] mb-2">15+</div>
                                    <p className="text-gray-600">Years of Excellence</p>
                                </div>
                                <div className="text-center p-4 about-stat about-stat-2">
                                    <div className="text-3xl font-bold text-[#47859e] mb-2">1000+</div>
                                    <p className="text-gray-600">Happy Guests</p>
                                </div>
                                <div className="text-center p-4 about-stat about-stat-3">
                                    <div className="text-3xl font-bold text-[#47859e] mb-2">20+</div>
                                    <p className="text-gray-600">Premium Rooms</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                    id="accommodations-section"
                    data-animate
                    className={`py-20 bg-gray-50 scroll-animation ${
                        shouldAnimate('accommodations-section') ? 'animate delay-200' : ''
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#47859e] mb-12 text-center accommodations-title">Our Accommodations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-lg overflow-hidden shadow-lg accommodation-card accommodation-card-1">
                                <img src="https://placehold.co/600x400/47859e/FFFFFF/png?text=Luxury+Villa" alt="Villa" className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">Luxury Villas</h3>
                                    <p className="text-gray-600 mb-4">Private villas with stunning mountain views, featuring modern amenities and spacious living areas.</p>
                                    <Link href="/accommodations" className="text-[#47859e] font-medium hover:underline inline-flex items-center">
                                        Learn More <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg overflow-hidden shadow-lg accommodation-card accommodation-card-2">
                                <img src="https://placehold.co/600x400/47859e/FFFFFF/png?text=Cozy+Cabin" alt="Cabin" className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">Cozy Cabins</h3>
                                    <p className="text-gray-600 mb-4">Rustic comfort in nature's embrace, perfect for a romantic getaway or peaceful retreat.</p>
                                    <Link href="/accommodations" className="text-[#47859e] font-medium hover:underline inline-flex items-center">
                                        Learn More <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg overflow-hidden shadow-lg accommodation-card accommodation-card-3">
                                <img src="https://placehold.co/600x400/47859e/FFFFFF/png?text=Family+Cottage" alt="Cottage" className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">Family Cottages</h3>
                                    <p className="text-gray-600 mb-4">Spacious cottages designed for family comfort, complete with kitchen and living spaces.</p>
                                    <Link href="/accommodations" className="text-[#47859e] font-medium hover:underline inline-flex items-center">
                                        Learn More <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                    id="amenities-section"
                    data-animate
                    className={`py-20 bg-white scroll-animation ${
                        shouldAnimate('amenities-section') ? 'animate delay-200' : ''
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#47859e] mb-12 text-center amenities-title">Resort Amenities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center amenity-item amenity-item-1">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <Waves className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Infinity Pool</h3>
                                <p className="text-gray-600">Swim with a view of the mountains</p>
                            </div>
                            <div className="text-center amenity-item amenity-item-2">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <Mountain className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Mountain Views</h3>
                                <p className="text-gray-600">Breathtaking panoramic vistas</p>
                            </div>
                            <div className="text-center amenity-item amenity-item-3">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <UtensilsCrossed className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">BBQ Area</h3>
                                <p className="text-gray-600">Perfect for outdoor gatherings</p>
                            </div>
                            <div className="text-center amenity-item amenity-item-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <TreePine className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Nature Trails</h3>
                                <p className="text-gray-600">Scenic hiking experiences</p>
                        </div>
                    </div>

                        <div 
                            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-300 ease-in-out ${
                                showAllAmenities 
                                    ? 'opacity-100 max-h-[500px] mt-8' 
                                    : 'opacity-0 max-h-0 overflow-hidden mt-0'
                            }`}
                        >
                            <div className="text-center amenity-item amenity-item-5">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <Wifi className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Free Wi-Fi</h3>
                                <p className="text-gray-600">Stay connected throughout</p>
                            </div>
                            <div className="text-center amenity-item amenity-item-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <Coffee className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Café & Restaurant</h3>
                                <p className="text-gray-600">Local and international cuisine</p>
                            </div>
                            <div className="text-center amenity-item amenity-item-7">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <Dumbbell className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Fitness Center</h3>
                                <p className="text-gray-600">Stay fit during your stay</p>
                            </div>
                            <div className="text-center amenity-item amenity-item-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#47859e]/10 rounded-full flex items-center justify-center">
                                    <Car className="w-8 h-8 text-[#47859e]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Free Parking</h3>
                                <p className="text-gray-600">Secure parking for guests</p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute left-1/2 -translate-x-1/2 translate-y-8">
                                <button 
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#47859e] hover:bg-[#47859e] hover:text-white transition-all duration-300 shadow-lg"
                                    aria-label={showAllAmenities ? "Show less amenities" : "Show more amenities"}
                                >
                                    <ChevronDown 
                                        className={`w-6 h-6 transition-transform duration-300 ${
                                            showAllAmenities ? 'rotate-180' : 'rotate-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                    id="booking-section"
                    data-animate
                    className={`py-20 bg-gray-50 scroll-animation ${
                        shouldAnimate('booking-section') ? 'animate delay-200' : ''
                    }`}
                    ref={bookingFormRef}
                >
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-[#47859e] mb-2">Make a Reservation</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Fill in your details to book your stay</p>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Guest Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={data.first_name}
                                                    onChange={e => handleInputChange('first_name', e.target.value)}
                                                    placeholder="Enter first name"
                                                    className={errors.first_name ? 'border-red-500' : ''}
                                                />
                                                {errors.first_name && (
                                                    <p className="text-sm text-red-500">{errors.first_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={data.last_name}
                                                    onChange={e => handleInputChange('last_name', e.target.value)}
                                                    placeholder="Enter last name"
                                                    className={errors.last_name ? 'border-red-500' : ''}
                                                />
                                                {errors.last_name && (
                                                    <p className="text-sm text-red-500">{errors.last_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => handleInputChange('email', e.target.value)}
                                                    placeholder="Enter email address"
                                                    className={errors.email ? 'border-red-500' : ''}
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-red-500">{errors.email}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={e => handleInputChange('phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                    className={errors.phone ? 'border-red-500' : ''}
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-500">{errors.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="check-in">Check-in Date</Label>
                                                <Input
                                                    id="check-in"
                                                    type="date"
                                                    value={data.check_in_date ? format(new Date(data.check_in_date), 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => {
                                                        const dateValue = e.target.value ? new Date(e.target.value) : null;
                                                        setData('check_in_date', dateValue);
                                                        clearErrors('check_in_date');
                                                    }}
                                                    min={format(new Date(), 'yyyy-MM-dd')}
                                                    onKeyDown={(e) => e.preventDefault()}
                                                    className="max-w-[12rem]"
                                                />
                                                {errors.check_in_date && (
                                                    <p className="text-sm text-red-500">{errors.check_in_date}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="check-out">Check-out Date</Label>
                                                <Input
                                                    id="check-out"
                                                    type="date"
                                                    value={data.check_out_date ? format(new Date(data.check_out_date), 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => {
                                                        const dateValue = e.target.value ? new Date(e.target.value) : null;
                                                        setData('check_out_date', dateValue);
                                                        clearErrors('check_out_date');
                                                    }}
                                                    min={data.check_in_date ? format(addDays(new Date(data.check_in_date), 1), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                                    onKeyDown={(e) => e.preventDefault()}
                                                    className="max-w-[12rem]"
                                                />
                                                {errors.check_out_date && (
                                                    <p className="text-sm text-red-500">{errors.check_out_date}</p>
                                                )}
                                            </div>
                                            
                                            {/* Room Type Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="roomType">Room Type</Label>
                                                <Select
                                                    value={data.room_type}
                                                    onValueChange={(value) => handleInputChange('room_type', value)}
                                                >
                                                    <SelectTrigger className={errors.room_type ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select room type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roomTypes.map((type) => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.room_type && (
                                                    <p className="text-sm text-red-500">{errors.room_type}</p>
                                                )}
                                                {data.room_type && data.check_in_date && data.check_out_date && availableRoomNumbers.length === 0 && !isLoadingRooms && (
                                                    <p className="text-sm text-amber-500">No {data.room_type}s available for the selected dates. Please try different dates or room type.</p>
                                                )}
                                                {data.room_type && data.check_in_date && data.check_out_date && availableRoomNumbers.length > 0 && !isLoadingRooms && (
                                                    <p className="text-sm text-green-500">Found {availableRoomNumbers.length} available {data.room_type}{availableRoomNumbers.length > 1 ? 's' : ''}: {availableRoomNumbers.join(', ')}</p>
                                                )}
                                            </div>
                                            
                                            {/* Room Number Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="roomNumber">Room Number</Label>
                                                <Select
                                                    value={data.room_number}
                                                    onValueChange={(value) => handleInputChange('room_number', value)}
                                                    disabled={!data.room_type || isLoadingRooms || availableRoomNumbers.length === 0}
                                                >
                                                    <SelectTrigger className={errors.room_number ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder={
                                                            !data.room_type ? "Select room type first" : 
                                                            isLoadingRooms ? "Loading..." : 
                                                            availableRoomNumbers.length === 0 ? "No rooms available" :
                                                            "Select room number"
                                                        } />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableRoomNumbers.map((number) => (
                                                            <SelectItem key={number} value={number}>{number}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.room_number && (
                                                    <p className="text-sm text-red-500">{errors.room_number}</p>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="numberOfGuests">Number of Guests</Label>
                                                <div className="flex gap-2">
                                                    <Select 
                                                        value={numberOfGuests} 
                                                        onValueChange={(value) => {
                                                            setNumberOfGuests(value);
                                                            if (value === 'custom') {
                                                                // When "Custom" is selected, don't update the form data yet
                                                                setData('number_of_guests', '');
                                                            } else {
                                                                handleInputChange('number_of_guests', value);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className={`flex-1 ${errors.number_of_guests && !numberOfGuests ? 'border-red-500' : ''}`}>
                                                            <SelectValue placeholder="Select number of guests" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">1 Guest</SelectItem>
                                                            <SelectItem value="2">2 Guests</SelectItem>
                                                            <SelectItem value="3">3 Guests</SelectItem>
                                                            <SelectItem value="4">4 Guests</SelectItem>
                                                            <SelectItem value="custom">Custom number</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {numberOfGuests === 'custom' && (
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            placeholder="number of guests"
                                                            value={data.number_of_guests}
                                                            onChange={e => handleInputChange('number_of_guests', e.target.value)}
                                                            className={`w-42 ${errors.number_of_guests ? 'border-red-500' : ''}`}
                                                        />
                                                    )}
                                                </div>
                                                {errors.number_of_guests && (
                                                    <p className="text-sm text-red-500">{errors.number_of_guests}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Requests */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Additional Requests</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="specialRequests">Special Requests</Label>
                                            <Input
                                                id="specialRequests"
                                                value={data.special_requests}
                                                onChange={e => setData('special_requests', e.target.value)}
                                                placeholder="Enter any special requests or requirements"
                                            />
                                            {errors.special_requests && (
                                                <p className="text-sm text-red-500">{errors.special_requests}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#47859e] text-white py-3 rounded-md hover:bg-[#3a7186] transition-colors"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <span className="mr-2">Booking...</span>
                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                </div>
                                            ) : (
                                                'Book Now'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                    id="contact-section"
                    data-animate
                    className={`py-20 bg-white scroll-animation ${
                        shouldAnimate('contact-section') ? 'animate delay-200' : ''
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#47859e] mb-12 text-center contact-title">Contact Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <div className="flex items-center mb-6 contact-info contact-info-1">
                                    <Phone className="h-6 w-6 text-[#47859e] mr-3" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone</h3>
                                        <p className="text-gray-600">+63 917 103 4461</p>
                                    </div>
                                </div>
                                <div className="flex items-center mb-6 contact-info contact-info-2">
                                    <Mail className="h-6 w-6 text-[#47859e] mr-3" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <p className="text-gray-600">contact@skynaturepark.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center contact-info contact-info-3">
                                    <MapPin className="h-6 w-6 text-[#47859e] mr-3" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Location</h3>
                                        <p className="text-gray-600">Sitio Majo, Poblacion Malungon, Sarangani Province</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 contact-form">
                                <input 
                                    type="text" 
                                    placeholder="Your Name" 
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#47859e]" 
                                />
                                <input 
                                    type="email" 
                                    placeholder="Your Email" 
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#47859e]" 
                                />
                                <textarea 
                                    placeholder="Your Message" 
                                    rows={4} 
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#47859e]"
                                ></textarea>
                                <button className="w-full bg-[#47859e] text-white py-3 rounded-md hover:bg-[#3a7186] transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section 
                    id="faq-section"
                    data-animate
                    className={`py-20 bg-gray-50 scroll-animation ${
                        shouldAnimate('faq-section') ? 'animate delay-200' : ''
                    }`}
                >
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#47859e] mb-12 text-center faq-title">Frequently Asked Questions</h2>
                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqItems.slice(0, showAllFAQs ? faqItems.length : 2).map((faq, index) => (
                                <div 
                                    key={index} 
                                    className={`bg-white rounded-lg shadow-sm overflow-hidden faq-item faq-item-${index}`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                                        {expandedFAQs.includes(index) ? (
                                            <Minus className="h-5 w-5 text-[#47859e]" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-[#47859e]" />
                                        )}
                                    </button>
                                    {expandedFAQs.includes(index) && (
                                        <div className="px-6 pb-4">
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {faqItems.length > 2 && (
                                <div className="text-center mt-8 faq-more-button">
                                    <button 
                                        onClick={() => setShowAllFAQs(!showAllFAQs)}
                                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg text-[#47859e] hover:bg-[#47859e] hover:text-white transition-all duration-300"
                                        aria-label={showAllFAQs ? "Show less FAQs" : "Show more FAQs"}
                                    >
                                        {showAllFAQs ? (
                                            <ChevronUp className="h-6 w-6" />
                                        ) : (
                                            <ChevronDown className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <footer className="bg-gray-900 text-white py-12">
                    <div className="container mx-auto px-4 sm:px-[120px]">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Sky Nature Park</h3>
                                <p className="text-gray-400">Your perfect mountain getaway destination</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <button 
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => scrollToSection(e as any, 'about-section')}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            About Us
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => scrollToSection(e as any, 'accommodations-section')}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Accommodations
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => scrollToSection(e as any, 'amenities-section')}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Amenities
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => scrollToSection(e as any, 'contact-section')}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Contact
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Policies</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <button 
                                            onClick={() => setShowTermsModal(true)}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Terms & Conditions
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => setShowPrivacyModal(true)}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            Privacy Policy
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => scrollToSection(e as any, 'faq-section')}
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            FAQs
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <Facebook className="h-6 w-6" />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <Instagram className="h-6 w-6" />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <Twitter className="h-6 w-6" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; {new Date().getFullYear()} Sky Nature Park. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                {/* Terms and Conditions Modal */}
                {showTermsModal && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                        <div className="bg-white text-gray-900 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
                            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold">Terms & Conditions</h2>
                                <button 
                                    onClick={() => setShowTermsModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-3">1. Reservation and Payment</h3>
                                <p className="mb-4">Reservations at Sky Nature Park require a valid credit card at the time of booking. Full payment is due upon check-in. We accept major credit cards and cash.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">2. Cancellation Policy</h3>
                                <p className="mb-4">Cancellations made at least 48 hours prior to the scheduled arrival date will receive a full refund. Cancellations made within 48 hours of the scheduled arrival date may be subject to a cancellation fee equivalent to one night's stay.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">3. Check-in and Check-out</h3>
                                <p className="mb-4">Check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability and additional charges may apply.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">4. Property Rules</h3>
                                <p className="mb-4">Guests are expected to conduct themselves in a manner that does not disturb other guests. Smoking is prohibited in all indoor areas. Pets are allowed in designated accommodations only with prior approval and additional pet fee.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">5. Liability</h3>
                                <p className="mb-4">Sky Nature Park is not responsible for any loss, theft, or damage to guests' personal belongings. Use of resort facilities, including the swimming pool, hiking trails, and other recreational areas, is at the guest's own risk.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">6. Modifications</h3>
                                <p className="mb-4">These terms and conditions may be modified or amended as necessary. Any changes will be posted on our website and will be effective immediately upon posting.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Policy Modal */}
                {showPrivacyModal && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                        <div className="bg-white text-gray-900 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
                            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold">Privacy Policy</h2>
                                <button 
                                    onClick={() => setShowPrivacyModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                                <p className="mb-4">We collect personal information when you make a reservation, including your name, contact information, payment details, and travel preferences. We may also collect information about your stay and use of our facilities.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                                <p className="mb-4">We use your information to process reservations, provide services during your stay, communicate with you about your booking, and improve our services. We may use your email address to send promotional offers and updates if you have opted in to receive such communications.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
                                <p className="mb-4">We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in our business operations, such as payment processing and email delivery services. We may also disclose information if required by law.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                                <p className="mb-4">We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">5. Cookies and Similar Technologies</h3>
                                <p className="mb-4">Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.</p>
                                
                                <h3 className="text-lg font-semibold mb-3">6. Your Rights</h3>
                                <p className="mb-4">You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us at privacy@skynaturepark.com.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Confirmation Dialog */}
                {showConfirmDialog && bookingData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 text-[#47859e]">Confirm Your Booking</h2>
                            <p className="mb-4 text-gray-600">Please review your booking details below:</p>
                            
                            <div className="space-y-3 mb-6">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-gray-600">Name:</div>
                                    <div className="font-medium">{bookingData.first_name} {bookingData.last_name}</div>
                                    
                                    <div className="text-gray-600">Email:</div>
                                    <div className="font-medium">{bookingData.email}</div>
                                    
                                    <div className="text-gray-600">Phone:</div>
                                    <div className="font-medium">{bookingData.phone}</div>
                                    
                                    <div className="text-gray-600">Room:</div>
                                    <div className="font-medium">{roomTypesWithIds.find(r => r.id === parseInt(bookingData.accommodation_id))?.name || bookingData.accommodation_id}</div>
                                    
                                    <div className="text-gray-600">Check-in:</div>
                                    <div className="font-medium">{bookingData.check_in?.split(' ')[0]}</div>
                                    
                                    <div className="text-gray-600">Check-out:</div>
                                    <div className="font-medium">{bookingData.check_out?.split(' ')[0]}</div>
                                    
                                    <div className="text-gray-600">Guests:</div>
                                    <div className="font-medium">{bookingData.number_of_guests}</div>
                                    
                                    {bookingData.special_requests && (
                                        <>
                                            <div className="text-gray-600">Special Requests:</div>
                                            <div className="font-medium">{bookingData.special_requests}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={handleCancelBooking}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmBooking}
                                    className="px-4 py-2 bg-[#47859e] text-white rounded hover:bg-[#3a7186] transition"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Success Confirmation Popup */}
                {showBookingConfirmation && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                        <div className="bg-white text-gray-900 rounded-lg w-full max-w-md overflow-auto">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <h2 className="text-xl font-semibold mb-4">Booking Request Received!</h2>
                                <p className="mb-6 text-gray-600">
                                    Thank you for your reservation request. Sky Nature Park will contact you shortly to confirm your booking details.
                                </p>
                                <button 
                                    onClick={() => setShowBookingConfirmation(false)}
                                    className="inline-flex justify-center px-6 py-3 bg-[#47859e] text-white rounded-md hover:bg-[#3a7186] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
