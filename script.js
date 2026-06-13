/* ==========================================================================
   Butter & Bloom - Interactive Features & Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 0. Dark / Light Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlEl = document.documentElement;

    // Restore saved preference (default: light)
    const savedTheme = localStorage.getItem('bb-theme') || 'light';
    if (savedTheme === 'dark') {
        htmlEl.setAttribute('data-theme', 'dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = htmlEl.getAttribute('data-theme') === 'dark';
            if (isDark) {
                htmlEl.removeAttribute('data-theme');
                localStorage.setItem('bb-theme', 'light');
            } else {
                htmlEl.setAttribute('data-theme', 'dark');
                localStorage.setItem('bb-theme', 'dark');
            }
        });
    }

    // 0.1 Dynamic Login/Logout Navbar State
    const updateLoginNavbarState = () => {
        const loginLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.getAttribute('href') === 'login.html' || link.id === 'nav-login-logout');
        const currentUser = localStorage.getItem('bb-user');
        
        if (loginLink) {
            if (currentUser) {
                loginLink.id = 'nav-login-logout';
                loginLink.innerHTML = `Sign Out (${currentUser})`;
                loginLink.setAttribute('href', '#');
                
                // Remove old event listener by replacing the element or adding a clean handler
                const newLink = loginLink.cloneNode(true);
                loginLink.parentNode.replaceChild(newLink, loginLink);
                
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('bb-user');
                    if (window.showToast) {
                        window.showToast('Logged out successfully. Goodbye!', '🚪');
                    }
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                });
            } else {
                loginLink.innerHTML = 'Sign In';
                loginLink.setAttribute('href', 'login.html');
            }
        }
    };
    updateLoginNavbarState();
    document.addEventListener('login-state-changed', updateLoginNavbarState);

    // 1. Initial Load Actions
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // 2. Fixed Header Scroll State
    const header = document.getElementById('site-header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load

    // 3. Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navBar = document.getElementById('navigation-bar');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navBar) {
        menuToggle.addEventListener('click', () => {
            navBar.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navBar.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });
    }

    // 4. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }

    // 5. Testimonials Slider / Carousel
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        showSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        showSlide(currentSlide - 1);
    };

    const startSlideShow = () => {
        stopSlideShow();
        slideInterval = setInterval(nextSlide, 7000); // Auto-slide every 7s
    };

    const stopSlideShow = () => {
        if (slideInterval) clearInterval(slideInterval);
    };

    if (slides.length > 0) {
        // Event Listeners for controls
        if (prevBtn) prevBtn.addEventListener('click', () => {
            prevSlide();
            startSlideShow(); // Reset timer
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            nextSlide();
            startSlideShow(); // Reset timer
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                showSlide(index);
                startSlideShow(); // Reset timer
            });
        });

        // Pause slideshow on hover
        const sliderContainer = document.querySelector('.testimonial-slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopSlideShow);
            sliderContainer.addEventListener('mouseleave', startSlideShow);
        }

        // Initialize slider
        showSlide(currentSlide);
        startSlideShow();
    }

    // 6. Interactive Custom Cake Configurator
    const cakeForm = document.getElementById('cake-configurator-form');
    
    // Form Inputs
    const flavorSelect = document.getElementById('cake-flavor');
    const sizeRadios = document.getElementsByName('cake-size');
    const themeSelect = document.getElementById('cake-theme');
    const decorCheckboxes = document.getElementsByName('cake-decor');
    const messageInput = document.getElementById('cake-message');

    // UI Summary Fields
    const summaryFlavor = document.getElementById('summary-flavor');
    const summarySize = document.getElementById('summary-size');
    const summaryTheme = document.getElementById('summary-theme');
    const summaryDecor = document.getElementById('summary-decor');
    const summaryMessage = document.getElementById('summary-message');
    const totalPriceText = document.getElementById('configurator-price');

    // Graphical Representation Elements
    const cakeIllustration = document.querySelector('.cake-illustration');
    const tier1 = document.getElementById('graphic-tier1');
    const tier2 = document.getElementById('graphic-tier2');
    const tier3 = document.getElementById('graphic-tier3');
    const themeOverlay = document.getElementById('theme-visual-effects');
    const plaquePreview = document.getElementById('plaque-preview');

    const updateCakeConfigurator = () => {
        if (!cakeForm) return;

        let totalVal = 0;

        // A. Flavor Selection
        const selectedFlavorOpt = flavorSelect.options[flavorSelect.selectedIndex];
        const flavorPrice = parseFloat(selectedFlavorOpt.getAttribute('data-price') || 0);
        const flavorText = selectedFlavorOpt.text.split(' (+')[0];
        totalVal += flavorPrice;
        summaryFlavor.textContent = flavorText;

        // Update color graphic class depending on flavor
        cakeIllustration.className = 'cake-illustration'; // reset
        cakeIllustration.classList.add(`flavor-${flavorSelect.value}`);

        // B. Size Selection (Radios)
        let selectedSizeText = '';
        let sizePrice = 0;
        let selectedSizeVal = '6inch';
        for (const radio of sizeRadios) {
            if (radio.checked) {
                sizePrice = parseFloat(radio.getAttribute('data-price') || 0);
                selectedSizeText = radio.nextElementSibling.querySelector('.radio-title').textContent;
                selectedSizeVal = radio.value;
                break;
            }
        }
        totalVal += sizePrice;
        summarySize.textContent = selectedSizeText;

        // Dynamic Graphical Tier Visibility based on Size selection
        if (selectedSizeVal === '6inch') {
            tier3.style.display = 'none';
            tier2.style.display = 'none';
            tier1.style.display = 'block';
            tier1.style.width = '110px';
            tier1.style.height = '60px';
        } else if (selectedSizeVal === '8inch') {
            tier3.style.display = 'none';
            tier2.style.display = 'none';
            tier1.style.display = 'block';
            tier1.style.width = '140px';
            tier1.style.height = '65px';
        } else if (selectedSizeVal === 'twotier') {
            tier3.style.display = 'none';
            tier2.style.display = 'block';
            tier1.style.display = 'block';
            
            // Adjust dimensions
            tier2.style.width = '100px';
            tier2.style.height = '45px';
            tier1.style.width = '130px';
            tier1.style.height = '50px';
        } else if (selectedSizeVal === 'threetier') {
            tier3.style.display = 'block';
            tier2.style.display = 'block';
            tier1.style.display = 'block';
            
            // Adjust dimensions
            tier3.style.width = '70px';
            tier3.style.height = '35px';
            tier2.style.width = '100px';
            tier2.style.height = '40px';
            tier1.style.width = '130px';
            tier1.style.height = '45px';
        }

        // C. Theme Selection
        const selectedThemeOpt = themeSelect.options[themeSelect.selectedIndex];
        const themePrice = parseFloat(selectedThemeOpt.getAttribute('data-price') || 0);
        const themeText = selectedThemeOpt.text.split(' (+')[0];
        totalVal += themePrice;
        summaryTheme.textContent = themeText;

        // Update Theme Overlay Text
        themeOverlay.textContent = themeText;

        // D. Extra Decorations (Checkboxes)
        const selectedDecors = [];
        let decorPriceSum = 0;
        for (const checkbox of decorCheckboxes) {
            if (checkbox.checked) {
                const price = parseFloat(checkbox.getAttribute('data-price') || 0);
                const name = checkbox.nextElementSibling.querySelector('.decor-name').textContent;
                decorPriceSum += price;
                selectedDecors.push(name);
            }
        }
        totalVal += decorPriceSum;
        summaryDecor.textContent = selectedDecors.length > 0 ? selectedDecors.join(', ') : 'None selected';

        // E. Personalized Message
        const msgText = messageInput.value.trim();
        if (msgText !== '') {
            summaryMessage.textContent = `"${msgText}"`;
            summaryMessage.classList.remove('italic');
            plaquePreview.style.display = 'block';
            plaquePreview.textContent = msgText;
        } else {
            summaryMessage.textContent = 'None';
            summaryMessage.classList.add('italic');
            plaquePreview.style.display = 'none';
        }

        // F. Price Render (INR)
        totalPriceText.textContent = '₹' + Math.round(totalVal).toLocaleString('en-IN');
    };

    // Attach Event Listeners for configurator update
    if (cakeForm) {
        flavorSelect.addEventListener('change', updateCakeConfigurator);
        sizeRadios.forEach(radio => radio.addEventListener('change', updateCakeConfigurator));
        themeSelect.addEventListener('change', updateCakeConfigurator);
        decorCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateCakeConfigurator));
        messageInput.addEventListener('input', updateCakeConfigurator);

        // Run once on load to initialize defaults
        updateCakeConfigurator();
    }

    // 7. Toast Alerts System
    const toastContainer = document.getElementById('toast-container');
    const showToast = (message, icon = '✨') => {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('active');
        }, 10);

        // Animate out and remove after 4s
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    };

    // 8. Order / Reservation Modals
    const orderModal = document.getElementById('order-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBodyContent = document.getElementById('modal-body-content');

    const openModal = (htmlContent) => {
        if (!orderModal || !modalBodyContent) return;
        modalBodyContent.innerHTML = htmlContent;
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    };

    const closeModal = () => {
        if (!orderModal) return;
        orderModal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scrolling
    };

    // Export globally for other subpages to use
    window.showToast = showToast;
    window.openModal = openModal;
    window.closeModal = closeModal;

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                closeModal();
            }
        });
    }

    // 9. Attach Event Listeners to Buttons
    
    // A. Best Sellers "Add to Cart" Buttons (homepage)
    const reserveButtons = [
        { id: 'buy-croissant',  name: 'Signature Butter Croissant', price: 380 },
        { id: 'buy-rose-cake',  name: 'Raspberry Rose Cake',         price: 4400 },
        { id: 'buy-macarons',   name: 'Vanilla Bean Macarons',       price: 1500 },
        { id: 'buy-eclair',     name: 'Belgian Chocolate Éclair',    price: 550 }
    ];

    reserveButtons.forEach(btnInfo => {
        const btn = document.getElementById(btnInfo.id);
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.BB_Cart) {
                    BB_Cart.addItem(btnInfo.id, btnInfo.name, btnInfo.price);
                }
            });
        }
    });

    // B. Custom Cake Design Submission Button
    const configuratorBtn = document.getElementById('configurator-btn');
    if (configuratorBtn) {
        configuratorBtn.addEventListener('click', () => {
            // Read configuration values
            const selectedFlavorOpt = flavorSelect.options[flavorSelect.selectedIndex];
            const flavorText = selectedFlavorOpt.text.split(' (+')[0];
            
            let selectedSizeText = '';
            for (const radio of sizeRadios) {
                if (radio.checked) {
                    selectedSizeText = radio.nextElementSibling.querySelector('.radio-title').textContent;
                    break;
                }
            }

            const selectedThemeOpt = themeSelect.options[themeSelect.selectedIndex];
            const themeText = selectedThemeOpt.text.split(' (+')[0];

            const selectedDecors = [];
            for (const checkbox of decorCheckboxes) {
                if (checkbox.checked) {
                    const name = checkbox.nextElementSibling.querySelector('.decor-name').textContent;
                    selectedDecors.push(name);
                }
            }
            const decorText = selectedDecors.length > 0 ? selectedDecors.join(', ') : 'None';
            const msgText = messageInput.value.trim() ? `"${messageInput.value.trim()}"` : 'None';
            const finalPrice = totalPriceText.textContent;

            showToast("Submitting your custom design to our Pâtissiers...", '🎂');

            setTimeout(() => {
                const modalHtml = `
                    <div class="modal-body-success">
                        <div class="success-icon">🍰</div>
                        <h3 class="success-title">Design Approved!</h3>
                        <p class="success-message">
                            Your dream cake has been custom-drafted. Our pastry chefs have received your specifications and are ready to bring it to life!
                        </p>
                        
                        <div style="text-align: left; width: 100%; background: var(--warm-beige); padding: 20px; border-radius: 16px; margin: 15px 0; border: 1px solid rgba(197, 168, 128, 0.2);">
                            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight:600; margin-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 4px;">Specification Details</h4>
                            <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
                                <li><strong>Flavor Profile:</strong> ${flavorText}</li>
                                <li><strong>Tier Size:</strong> ${selectedSizeText}</li>
                                <li><strong>Aesthetic Style:</strong> ${themeText}</li>
                                <li><strong>Custom Detailing:</strong> ${decorText}</li>
                                <li><strong>Plaque Message:</strong> ${msgText}</li>
                                <li style="margin-top: 10px; font-size: 1.05rem; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 8px; font-weight: 700; color: var(--gold-dark); display: flex; justify-content: space-between;">
                                    <span>Estimated Total:</span> <span>${finalPrice}</span>
                                </li>
                            </ul>
                        </div>

                        <p class="success-message" style="font-size: 0.82rem;">
                            Our design team will contact you via email within 24 hours to finalize details and secure deposit.
                        </p>
                        <button class="btn btn-primary btn-sm btn-full" onclick="document.getElementById('modal-close-btn').click()">Done</button>
                    </div>
                `;
                openModal(modalHtml);
            }, 800);
        });
    }

    // C. Final CTA "Order Online"
    const orderOnlineBtn = document.getElementById('order-online-btn');
    if (orderOnlineBtn) {
        orderOnlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to the configurator and trigger alert
            const customOrderSection = document.getElementById('custom-orders');
            if (customOrderSection) {
                customOrderSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    showToast("Configure your custom cake or choose from our best sellers!", '✨');
                }, 800);
            }
        });
    }

    // D. Gallery Item Zoom View (Mockup)
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('.gallery-img').getAttribute('src');
            const imgAlt = item.querySelector('.gallery-img').getAttribute('alt');
            const title = item.querySelector('.gallery-title').textContent;

            const modalHtml = `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <h3 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 500; border-bottom: 1px solid var(--warm-beige); padding-bottom: 8px;">${title}</h3>
                    <div style="border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-md); border: 2px solid var(--white);">
                        <img src="${imgSrc}" alt="${imgAlt}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover;">
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-muted); text-align: center;">
                        Handcrafted daily using only clean organic ingredients in our open pâtisserie lab.
                    </p>
                </div>
            `;
            openModal(modalHtml);
        });
    });
});
