// global variables define

let allProducts = [];
let cart = [];
let userBalance = 1000;
let couponApplied = false;
let discountPercent = 0;
let currentBanner = 0;
let bannerInterval;
let currentReview = 0;
let reviewInterval;

// initialization
document.addEventListener('DOMContentLoaded', () => {
  loadBalance();
  loadDarkMode();
  fetchProducts();
  initBanner();
  initReviews();
  initFAQ();
  initTeam();
  initScrollSpy();
  initBackToTop();
});

// Dark mode toggle er jonno function

function toggleDarkMode() {
  document.querySelector('html').classList.toggle('dark');
  // Save preference
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('smartshop_dark', isDark);
}

function loadDarkMode() {
  const saved = localStorage.getItem('smartshop_dark');
  if (saved === 'true') {
    document.documentElement.classList.add('dark');
  }
}

// mobile menu toggle er jonno function

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}
// Close mobile menu jokon user clicks a link inside it
document.addEventListener('click', e => {
  if (e.target.closest('#mobileMenu a')) {
    document.getElementById('mobileMenu').classList.add('hidden');
  }
});

// 3. SCROLL SPY – Active Nav Link

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove(
        'active',
        'bg-brand-50',
        'dark:bg-gray-800',
        'text-brand-600',
        'dark:text-brand-400',
      );
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add(
          'active',
          'bg-brand-50',
          'dark:bg-gray-800',
          'text-brand-600',
          'dark:text-brand-400',
        );
      }
    });
  });
}

// 4. BACK TO TOP

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.remove('opacity-0', 'pointer-events-none');
      btn.classList.add('opacity-100');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none');
      btn.classList.remove('opacity-100');
    }
  });
}

// 5. SLIDING BANNER
function initBanner() {
  // Banner data – using picsum images
  const banners = [
    {
      img: './assects/img1.jpeg',
      title: 'Girls Collection',
      sub: 'Up to 50% off on trending items',
    },
    {
      img: './assects/img2.jpg',
      title: ' Summer collection 2026',
      sub: 'Best deals on gadgets and accessories',
    },
    {
      img: './assects/img3.jpg',
      title: 'Free Shipping Week',
      sub: 'Order now and get free delivery',
    },
    {
      img: './assects/img4.jpg',
      title: 'New Arrivals',
      sub: 'Check out the latest products',
    },
  ];

  const container = document.getElementById('bannerContainer');
  const dotsContainer = document.getElementById('bannerDots');

  // Create slides
  banners.forEach((b, i) => {
    const slide = document.createElement('div');
    slide.className = `banner-slide absolute inset-0 ${i === 0 ? 'opacity-100' : 'opacity-0'}`;
    slide.innerHTML = `
          <img src="${b.img}" alt="${b.title}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div class="px-8 sm:px-16 max-w-lg">
              <h2 class="text-3xl sm:text-5xl font-900 text-white mb-3">${b.title}</h2>
              <p class="text-white/80 text-sm sm:text-base mb-5">${b.sub}</p>
              <a href="#products" class="inline-block px-6 py-2.5 bg-brand-600 text-white rounded-lg font-600 hover:bg-brand-700 transition text-sm">Shop Now</a>
            </div>
          </div>
        `;
    container.appendChild(slide);

    // Create dot
    const dot = document.createElement('button');
    dot.className = `w-2.5 h-2.5 rounded-full transition ${i === 0 ? 'bg-white w-7' : 'bg-white/50'}`;
    dot.onclick = () => goToBanner(i);
    dotsContainer.appendChild(dot);
  });

  // Auto slide every 4 seconds
  bannerInterval = setInterval(nextBanner, 4000);
}

function goToBanner(index) {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('#bannerDots button');
  slides.forEach((s, i) => {
    s.classList.toggle('opacity-100', i === index);
    s.classList.toggle('opacity-0', i !== index);
  });
  dots.forEach((d, i) => {
    d.className = `h-2.5 rounded-full transition ${i === index ? 'bg-white w-7' : 'bg-white/50 w-2.5'}`;
  });
  currentBanner = index;
  // Reset auto-slide timer
  clearInterval(bannerInterval);
  bannerInterval = setInterval(nextBanner, 4000);
}

function nextBanner() {
  const total = document.querySelectorAll('.banner-slide').length;
  goToBanner((currentBanner + 1) % total);
}

function prevBanner() {
  const total = document.querySelectorAll('.banner-slide').length;
  goToBanner((currentBanner - 1 + total) % total);
}

// 6. FETCH & DISPLAY PRODUCTS
async function fetchProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    allProducts = await res.json();
    populateCategories();
    filterProducts(); // Display all initially
  } catch (err) {
    document.getElementById('productGrid').innerHTML =
      '<p class="col-span-full text-center text-red-500 py-10">Failed to load products. Please try again later.</p>';
  }
}

// Populate category dropdown from product data
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const categories = [...new Set(allProducts.map(p => p.category))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(opt);
  });
}

// Filter, search, and sort products
function filterProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let filtered = allProducts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search);
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  // Sort
  if (sort === 'low-high') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'high-low') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'rating')
    filtered.sort((a, b) => b.rating.rate - a.rating.rate);

  renderProducts(filtered);
}

// Render product cards into the grid
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  const noMsg = document.getElementById('noProducts');

  if (products.length === 0) {
    grid.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }
  noMsg.classList.add('hidden');

  grid.innerHTML = products
    .map(
      (p, i) => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow hover:shadow-xl transition-shadow duration-300 fade-up group" style="animation-delay:${i * 0.05}s">
          <div class="relative overflow-hidden h-52 bg-gray-100 dark:bg-gray-700">
            <img src="${p.image}" alt="${p.title}" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <span class="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-700 px-2 py-0.5 rounded-full uppercase">${p.category}</span>
          </div>
          <div class="p-4">
            <h3 class="font-600 text-sm leading-snug mb-2 line-clamp-2 h-10">${p.title}</h3>
            <div class="flex items-center gap-1 mb-2">
              ${renderStars(p.rating.rate)}
              <span class="text-xs text-gray-400 ml-1">(${p.rating.count})</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-lg font-800 text-brand-700 dark:text-brand-400">${Math.round(p.price * 120)} BDT</span>
              <button onclick="addToCart(${p.id})" class="px-4 py-2 bg-brand-600 text-white text-xs font-600 rounded-lg hover:bg-brand-700 transition active:scale-95">
                <i class="fa-solid fa-plus mr-1"></i>Add
              </button>
            </div>
          </div>
        </div>
      `,
    )
    .join('');
}

// Helper: Render star icons from a rating number
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html +=
      i <= Math.round(rating)
        ? '<i class="fa-solid fa-star star-gold text-xs"></i>'
        : '<i class="fa-solid fa-star star-empty text-xs"></i>';
  }
  return html;
}

// 7. SHOPPING CART SYSTEM
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  // Convert price to BDT (approximate: 1 USD = 120 BDT)
  const priceBDT = Math.round(product.price * 120);

  // Check if already in cart
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: priceBDT,
      image: product.image,
      qty: 1,
    });
  }

  updateCartUI();
  showToast(`"${product.title.slice(0, 25)}..." added to cart`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  updateCartUI();
}

function updateCartUI() {
  const cartItemsEl = document.getElementById('cartItems');
  const emptyMsg = document.getElementById('emptyCartMsg');
  const footer = document.getElementById('cartFooter');
  const countEl = document.getElementById('cartCount');

  // Cart count badge
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (totalQty > 0) {
    countEl.textContent = totalQty;
    countEl.classList.remove('hidden');
  } else {
    countEl.classList.add('hidden');
  }

  // Empty state
  if (cart.length === 0) {
    cartItemsEl.innerHTML =
      '<p class="text-center text-gray-400 mt-10"><i class="fa-solid fa-cart-shopping text-4xl mb-3 block"></i>Your cart is empty</p>';
    footer.classList.add('hidden');
    return;
  }

  footer.classList.remove('hidden');

  // Render cart items
  cartItemsEl.innerHTML = cart
    .map(
      item => `
        <div class="flex gap-3 py-3 border-b dark:border-gray-800">
          <img src="${item.image}" alt="" class="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-500 truncate">${item.title}</p>
            <p class="text-sm font-700 text-brand-600 mt-0.5">${item.price} BDT</p>
            <div class="flex items-center gap-2 mt-1.5">
              <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition"><i class="fa-solid fa-minus text-[10px]"></i></button>
              <span class="text-sm font-600 w-5 text-center">${item.qty}</span>
              <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition"><i class="fa-solid fa-plus text-[10px]"></i></button>
              <button onclick="removeFromCart(${item.id})" class="ml-auto text-red-400 hover:text-red-600 text-xs transition"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      `,
    )
    .join('');

  // Calculate totals
  calculateTotals();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = 60;
  const shipping = 40;
  const discountAmount = couponApplied
    ? Math.round((subtotal * discountPercent) / 100)
    : 0;
  const total = subtotal + delivery + shipping - discountAmount;

  document.getElementById('subtotalDisplay').textContent = subtotal + ' BDT';
  document.getElementById('deliveryDisplay').textContent = delivery + ' BDT';
  document.getElementById('shippingDisplay').textContent = shipping + ' BDT';
  document.getElementById('totalDisplay').textContent = total + ' BDT';

  // Discount row
  const discountRow = document.getElementById('discountRow');
  if (couponApplied) {
    discountRow.classList.remove('hidden');
    discountRow.classList.add('flex');
    document.getElementById('discountDisplay').textContent =
      '-' + discountAmount + ' BDT';
  } else {
    discountRow.classList.add('hidden');
    discountRow.classList.remove('flex');
  }

  // Check balance
  if (total > userBalance) {
    document.getElementById('totalDisplay').classList.add('text-red-500');
    document.getElementById('totalDisplay').classList.remove('text-brand-600');
  } else {
    document.getElementById('totalDisplay').classList.remove('text-red-500');
    document.getElementById('totalDisplay').classList.add('text-brand-600');
  }
}

// Toggle cart sidebar
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = !sidebar.classList.contains('translate-x-full');
  if (isOpen) {
    sidebar.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

// Apply coupon code
function applyCoupon() {
  const input = document.getElementById('couponInput');
  const msg = document.getElementById('couponMsg');
  const code = input.value.trim().toUpperCase();

  if (code === 'SMART10') {
    couponApplied = true;
    discountPercent = 10;
    msg.textContent = 'Coupon applied! 10% discount.';
    msg.className = 'text-xs text-brand-600 font-600';
    msg.classList.remove('hidden');
    showToast('Coupon SMART10 applied – 10% off!', 'success');
  } else {
    couponApplied = false;
    discountPercent = 0;
    msg.textContent = 'Invalid coupon code.';
    msg.className = 'text-xs text-red-500';
    msg.classList.remove('hidden');
  }
  calculateTotals();
}

// Checkout
function checkout() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = 60;
  const shipping = 40;
  const discountAmount = couponApplied
    ? Math.round((subtotal * discountPercent) / 100)
    : 0;
  const total = subtotal + delivery + shipping - discountAmount;

  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  if (total > userBalance) {
    showToast('Insufficient balance! Please add more money.', 'error');
    return;
  }

  // Deduct balance
  userBalance -= total;
  saveBalance();
  updateBalanceDisplay();

  // Clear cart
  cart = [];
  couponApplied = false;
  discountPercent = 0;
  document.getElementById('couponInput').value = '';
  document.getElementById('couponMsg').classList.add('hidden');
  updateCartUI();
  toggleCart();

  showToast('Order placed successfully! Thank you.', 'success');
}

// 8. USER BALANCE SYSTEM
function addMoney() {
  userBalance += 1000;
  saveBalance();
  updateBalanceDisplay();
  showToast('+1000 BDT added to your balance', 'success');
}

function updateBalanceDisplay() {
  document.getElementById('balanceAmount').textContent = userBalance;
  const mobileEl = document.getElementById('balanceAmountMobile');
  if (mobileEl) mobileEl.textContent = userBalance;
}

function saveBalance() {
  localStorage.setItem('smartshop_balance', userBalance);
}

function loadBalance() {
  const saved = localStorage.getItem('smartshop_balance');
  if (saved !== null) {
    userBalance = parseInt(saved);
  }
  updateBalanceDisplay();
}

// 9. REVIEW CAROUSEL
function initReviews() {
  // Local review data (as per requirement: local JSON or API)
  const reviews = [
    {
      name: 'Tanvir Ahmed',
      rating: 5,
      comment:
        'প্রোডাক্টের কোয়ালিটি সত্যিই অনেক ভালো! খুব দ্রুত ডেলিভারি পেয়েছি এবং প্যাকেজিংও দারুণ ছিল। আবার অর্ডার করবো ইনশাআল্লাহ।',
      date: '2025-01-15',
    },
    {
      name: 'Nusrat Jahan',
      rating: 4,
      comment:
        'মোটামুটি ভালো অভিজ্ঞতা। প্রোডাক্ট যেমন দেখানো ছিল ঠিক তেমনই পেয়েছি। ডেলিভারি একটু দেরি হয়েছে, তবে মোটের উপর সন্তুষ্ট।',
      date: '2025-02-03',
    },
    {
      name: 'Rafi Islam',
      rating: 5,
      comment:
        'বাংলাদেশের সেরা অনলাইন শপগুলোর একটি! দাম অনেক রিজনেবল এবং কাস্টমার সার্ভিস খুব ভালো।',
      date: '2025-02-20',
    },
    {
      name: 'Sadia Rahman',
      rating: 4,
      comment:
        'ইলেকট্রনিক্স প্রোডাক্ট অর্ডার করেছিলাম, একদম ঠিকঠাক অবস্থায় পেয়েছি। ব্যালেন্স সিস্টেমটাও ভালো লেগেছে।',
      date: '2025-03-05',
    },
    {
      name: 'Mehedi Hasan',
      rating: 5,
      comment:
        'SmartShop কখনো হতাশ করে না। কুপন ব্যবহার করে অনেক টাকা সেভ করতে পেরেছি। অবশ্যই রেকমেন্ড করবো!',
      date: '2025-03-18',
    },
    {
      name: 'Farzana Mim',
      rating: 3,
      comment:
        'প্রোডাক্ট মোটামুটি ভালো, তবে আরও ক্যাটাগরি থাকলে ভালো হতো। সার্চ অপশনটা বেশ কাজে লাগে।',
      date: '2025-04-01',
    },
  ];

  const track = document.getElementById('reviewTrack');
  track.innerHTML = reviews
    .map(
      r => `
        <div class="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 h-full transition-colors duration-300">
            <div class="flex items-center gap-1 mb-3">${renderStars(r.rating)}</div>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4">"${r.comment}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-brand-100 dark:bg-brand-900/40 text-brand-600 rounded-full flex items-center justify-center font-700 text-sm">${r.name.charAt(0)}</div>
              <div>
                <p class="text-sm font-600">${r.name}</p>
                <p class="text-xs text-gray-400">${r.date}</p>
              </div>
            </div>
          </div>
        </div>
      `,
    )
    .join('');

  // Auto slide reviews every 5 seconds
  reviewInterval = setInterval(nextReview, 5000);
}

function getReviewSlideWidth() {
  const track = document.getElementById('reviewTrack');
  if (window.innerWidth >= 1024) return 33.333; // 3 visible
  if (window.innerWidth >= 640) return 50; // 2 visible
  return 100; // 1 visible
}

function nextReview() {
  const totalSlides = document.querySelectorAll('#reviewTrack > div').length;
  const visible =
    window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = totalSlides - visible;
  currentReview = currentReview >= maxIndex ? 0 : currentReview + 1;
  slideReview();
}

function prevReview() {
  const totalSlides = document.querySelectorAll('#reviewTrack > div').length;
  const visible =
    window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = totalSlides - visible;
  currentReview = currentReview <= 0 ? maxIndex : currentReview - 1;
  slideReview();
}

function slideReview() {
  const track = document.getElementById('reviewTrack');
  const pct = getReviewSlideWidth();
  track.style.transform = `translateX(-${currentReview * pct}%)`;
  // Reset timer
  clearInterval(reviewInterval);
  reviewInterval = setInterval(nextReview, 5000);
}

// 10. CONTACT FORM VALIDATION
function handleContactSubmit(e) {
  e.preventDefault();
  let valid = true;

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  // Reset errors
  ['nameError', 'emailError', 'messageError'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('contactSuccess').classList.add('hidden');

  // Validate name
  if (name.length < 2) {
    showError(
      'nameError',
      'Please enter a valid name (at least 2 characters).',
    );
    valid = false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('emailError', 'Please enter a valid email address.');
    valid = false;
  }

  // Validate message
  if (message.length < 5) {
    showError('messageError', 'Message must be at least 5 characters.');
    valid = false;
  }

  if (valid) {
    document.getElementById('contactSuccess').classList.remove('hidden');
    document.getElementById('contactForm').reset();
    showToast('Message sent successfully!', 'success');
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

// 11. FAQ ACCORDION
function initFAQ() {
  const faqs = [
    {
      q: 'ব্যালেন্স সিস্টেম কীভাবে কাজ করে?',
      a: 'প্রতিটি ইউজার শুরুতে ১০০০ টাকা ব্যালেন্স পায়। ব্যালেন্সের পাশে থাকা "+" বাটনে ক্লিক করে আরও টাকা যোগ করতে পারবেন। আপনার ব্যালেন্স ব্রাউজারে সংরক্ষিত থাকে এবং পেজ রিলোড করলেও মুছে যায় না।',
    },

    {
      q: 'SMART10 কুপন কী?',
      a: 'কার্টে থাকা কুপন ফিল্ডে "SMART10" লিখলে আপনার মোট মূল্যের উপর ১০% ডিসকাউন্ট পাবেন।',
    },

    {
      q: 'প্রোডাক্টগুলো কোথা থেকে আসে?',
      a: 'সব প্রোডাক্ট ডাটা FakeStore API থেকে ডাইনামিকভাবে আনা হয়। এর মধ্যে প্রোডাক্টের নাম, ছবি, দাম এবং রেটিং অন্তর্ভুক্ত থাকে।',
    },

    {
      q: 'পেজ রিলোড করলে কি আমার ব্যালেন্স থেকে যাবে?',
      a: 'হ্যাঁ! আমরা localStorage ব্যবহার করি, তাই ব্রাউজার বন্ধ বা রিলোড করার পরেও আপনার ব্যালেন্স সংরক্ষিত থাকে।',
    },

    {
      q: 'আমি কীভাবে সাপোর্টের সাথে যোগাযোগ করবো?',
      a: 'Contact সেকশন ব্যবহার করে আমাদের মেসেজ পাঠাতে পারেন। আমরা যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করবো।',
    },
  ];

  const container = document.getElementById('faqContainer');
  container.innerHTML = faqs
    .map(
      (f, i) => `
        <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-colors duration-300">
          <button onclick="toggleFAQ(${i})" class="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <span>${f.q}</span>
            <i id="faqIcon${i}" class="fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-300"></i>
          </button>
          <div id="faqBody${i}" class="hidden px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">${f.a}</div>
        </div>
      `,
    )
    .join('');
}

function toggleFAQ(index) {
  const body = document.getElementById('faqBody' + index);
  const icon = document.getElementById('faqIcon' + index);
  body.classList.toggle('hidden');
  icon.style.transform = body.classList.contains('hidden')
    ? ''
    : 'rotate(180deg)';
}

// 12. TEAM MEMBERS
function initTeam() {
  const team = [
    {
      image: 'assects/rashed.jpeg',
      name: 'Md. Rashed Ali',
      role: 'Web Developer',
    },
    {
      image: 'assects/Neo.jpg',
      name: 'Emam Saimon',
      role: 'MERN Stack Developer',
    },
    {
      image: 'assects/mash.jpeg',
      name: 'MD MashRafi Abrar',
      role: 'UI/UX Designer',
    },
  ];

  const container = document.getElementById('teamContainer');

  container.innerHTML = team
    .map(
      t => `
    <div class="text-center">

      ${
        t.image
          ? `
            <img 
              src="${t.image}" 
              alt="${t.name}"
              class="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-gray-300 dark:border-gray-600"
            >
          `
          : `
            <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500">
              ${t.name.split(' ').pop().charAt(0)}
            </div>
          `
      }

      <p class="font-semibold text-sm">${t.name}</p>
      <p class="text-xs text-gray-400">${t.role}</p>

    </div>
  `,
    )
    .join('');
}

// 13. TOAST NOTIFICATION

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-brand-600',
    error: 'bg-red-500',
    info: 'bg-gray-700',
  };
  toast.className = `toast-enter ${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-500 flex items-center gap-2 max-w-xs`;
  const icon =
    type === 'success'
      ? 'fa-circle-check'
      : type === 'error'
        ? 'fa-circle-xmark'
        : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}
