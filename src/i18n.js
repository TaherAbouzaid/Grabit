import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          // Common
          "common": {
            "loading": "Loading...",
            "error": "An error occurred",
            "search": "Search Products...",
            "addToCart": "Add to Cart",
            "viewCart": "View Cart",
            "checkout": "Checkout",
            "continueShopping": "Continue Shopping",
            "price": "Price",
            "quantity": "Quantity",
            "total": "Total",
            "subtotal": "Subtotal",
            "shipping": "Shipping",
            "discount": "Discount",
            "totalAmount": "Total Amount",
            "orderSummary": "Order Summary",
            "billingDetails": "Billing Details",
            "paymentMethod": "Payment Method",
            "deliveryMethod": "Delivery Method",
            "placeOrder": "Place Order",
            "orderConfirmed": "Order Confirmed",
            "processingOrder": "Processing Order",
            "qualityCheck": "Quality Check",
            "productDispatched": "Product Dispatched",
            "productDelivered": "Product Delivered",
            "orderCancelled": "Order Cancelled",
            "worldsFastest": "World's Fastest Online Shopping Destination",
            "unknownProduct": "Unknown Product",
            "items": "ITEMS",
            "vat": "VAT (20%)",
            "noDescription": "No description available",
            "errorLoadingProducts": "Error loading products"
          },

          // Navigation
          "nav": {
            "home": "Home",
            "shop": "Shop",
            "categories": "Categories",
            "offers": "Offers",
            "blog": "Blog",
            "contact": "Contact Us",
            "about": "About Us",
            "cart": "Cart",
            "wishlist": "Wishlist",
            "profile": "Profile",
            "orders": "Orders",
            "login": "Login",
            "register": "Register",
            "logout": "Logout",
            "help": "Help?",
            "trackOrder": "Track Order",
            "allCategories": "All Categories",
            "pages": "Pages",
            "compare": "Compare",
            "faq": "FAQ",
            "viewCart": "View Cart",
            "checkout": "Check Out"
          },

          // Categories
          "categories": {
            "home_kitchen": "Home & Kitchen",
            "health_beauty": "Health & Beauty",
            "foods": "Foods",
            "health_devices": "Health Devices",
            "fruits": "Fruits",
            "vegetables": "Vegetables",
            "meat": "Meat & Seafood",
            "drinks": "Drinks",
            "snacks": "Snacks",
            "grocery": "Grocery",
            "fashion": "Fashion",
            "fashion2": "Fashion 2",
            "kitchen1": "Kitchen Appliances",
            "kitchen2": "Cookware",
            "kitchen3": "Kitchen Tools",
            "beauty1": "Skincare",
            "beauty2": "Makeup",
            "beauty3": "Hair Care",
            "food1": "Organic Foods",
            "food2": "Beverages",
            "food3": "Snacks",
            "device1": "Fitness Trackers",
            "device2": "Blood Pressure Monitors",
            "device3": "Thermometers"
          },

          // Blog
          "blog": {
            "latestPosts": "Latest Posts",
            "tipsAndTricks": "Tips & Tricks"
          },

          // Cart
          "cart": {
            "empty": "Your cart is empty",
            "loginRequired": "Please log in to view your cart",
            "orderSummary": "Order Summary",
            "remove": "Remove",
            "applyDiscount": "Apply Discount",
            "deliveryCharges": "Delivery Charges",
            "couponDiscount": "Coupon Discount"
          },

          // Brands
          "brands": {
            "bhisma_organice": "Bhisma Organice",
            "brand2": "Brand 2"
          },

          // Product Details
          "product": {
            "description": "Description",
            "specifications": "Specifications",
            "reviews": "Reviews",
            "relatedProducts": "Related Products",
            "inStock": "In Stock",
            "outOfStock": "Out of Stock",
            "quantity": "Quantity",
            "addToWishlist": "Add to Wishlist",
            "removeFromWishlist": "Remove from Wishlist",
            "share": "Share",
            "delivery": "Delivery",
            "returns": "Returns",
            "warranty": "Warranty"
          },

          // Checkout
          "checkout": {
            "loginRequired": "Please log in to proceed",
            "billingDetails": "Billing Details",
            "checkoutOptions": "Checkout Options",
            "existingAddress": "I want to use an existing address",
            "newAddress": "I want to use new address",
            "selectAddress": "Select an Address",
            "noSavedAddresses": "No saved addresses found",
            "firstName": "First Name*",
            "lastName": "Last Name*",
            "email": "Email*",
            "phone": "Phone*",
            "address": "Address*",
            "city": "City*",
            "postalCode": "Postal Code*",
            "country": "Country*",
            "regionState": "Region/State*",
            "firstNamePlaceholder": "Enter your first name",
            "lastNamePlaceholder": "Enter your last name",
            "addressPlaceholder": "Address Line 1",
            "postalCodePlaceholder": "Postal Code",
            "selectCountry": "Select Country",
            "selectState": "Select your state",
            "selectCity": "Select your city",
            "adding": "Adding...",
            "addAddress": "Add Address",
            "processing": "Processing...",
            "placeOrder": "Place Order",
            "orderSummary": "Order Summary",
            "deliveryMethod": "Delivery Method",
            "deliveryMethodDescription": "Please select the preferred shipping method to use on this order",
            "deliveryComments": "Add Comments About Your Order",
            "deliveryCommentsPlaceholder": "Comments",
            "paymentMethod": "Payment Method",
            "paymentMethodDescription": "Please select the preferred payment method to use on this order",
            "paymentComments": "Add Comments About Your Order",
            "paymentCommentsPlaceholder": "Comments",
            "terms": "I have read and agree to the Terms & Conditions",
            "applyDiscount": "Apply Discount",
            "standardDelivery": "Standard Delivery (5-7 business days)",
            "expressDelivery": "Express Delivery (2-3 business days)",
            "cashOnDelivery": "Cash on Delivery",
            "creditCard": "Credit Card"
          },

          // Hero Slider
          "hero": {
            "title": "Fresh & Healthy",
            "subtitle": "Natural Organic Products",
            "description": "We deliver organic vegetables & fruits",
            "shopNow": "Shop Now",
            "learnMore": "Learn More",
            "discount": "Discount",
            "off": "OFF",
            "newArrivals": "New Arrivals",
            "bestSellers": "Best Sellers",
            "featuredProducts": "Featured Products",
            "trendingProducts": "Trending Products"
          },

          // Product Categories
          "productCategories": {
            "fruits": "Fresh Fruits",
            "vegetables": "Fresh Vegetables",
            "meat": "Fresh Meat",
            "seafood": "Fresh Seafood",
            "dairy": "Dairy Products",
            "bakery": "Bakery Items",
            "beverages": "Beverages",
            "snacks": "Snacks",
            "organic": "Organic Products",
            "spices": "Spices & Herbs"
          }
        }
      },
      ar: {
        translation: {
          // Common
          "common": {
            "loading": "جاري التحميل...",
            "error": "حدث خطأ",
            "search": "البحث عن المنتجات...",
            "addToCart": "أضف إلى السلة",
            "viewCart": "عرض السلة",
            "checkout": "إتمام الشراء",
            "continueShopping": "متابعة التسوق",
            "price": "السعر",
            "quantity": "الكمية",
            "total": "المجموع",
            "subtotal": "المجموع الفرعي",
            "shipping": "الشحن",
            "discount": "الخصم",
            "totalAmount": "المبلغ الإجمالي",
            "orderSummary": "ملخص الطلب",
            "billingDetails": "تفاصيل الفواتير",
            "paymentMethod": "طريقة الدفع",
            "deliveryMethod": "طريقة التوصيل",
            "placeOrder": "تأكيد الطلب",
            "orderConfirmed": "تم تأكيد الطلب",
            "processingOrder": "جاري معالجة الطلب",
            "qualityCheck": "فحص الجودة",
            "productDispatched": "تم شحن المنتج",
            "productDelivered": "تم توصيل المنتج",
            "orderCancelled": "تم إلغاء الطلب",
            "worldsFastest": "أسرع وجهة تسوق عبر الإنترنت",
            "unknownProduct": "منتج غير معروف",
            "items": "منتجات",
            "vat": "الضريبة (20%)",
            "noDescription": "لا يوجد وصف متاح",
            "errorLoadingProducts": "خطأ في تحميل المنتجات"
          },

          // Navigation
          "nav": {
            "home": "الرئيسية",
            "shop": "المتجر",
            "categories": "التصنيفات",
            "offers": "العروض",
            "blog": "المدونة",
            "contact": "اتصل بنا",
            "about": "من نحن",
            "cart": "السلة",
            "wishlist": "المفضلة",
            "profile": "الملف الشخصي",
            "orders": "الطلبات",
            "login": "تسجيل الدخول",
            "register": "إنشاء حساب",
            "logout": "تسجيل الخروج",
            "help": "المساعدة؟",
            "trackOrder": "تتبع الطلب",
            "allCategories": "جميع التصنيفات",
            "pages": "الصفحات",
            "compare": "مقارنة",
            "faq": "الأسئلة الشائعة",
            "viewCart": "عرض السلة",
            "checkout": "إتمام الشراء"
          },

          // Categories
          "categories": {
            "home_kitchen": "المنزل والمطبخ",
            "health_beauty": "الصحة والجمال",
            "foods": "الأطعمة",
            "health_devices": "الأجهزة الصحية",
            "fruits": "الفواكه",
            "vegetables": "الخضروات",
            "meat": "اللحوم والمأكولات البحرية",
            "drinks": "المشروبات",
            "snacks": "الوجبات الخفيفة",
            "grocery": "البقالة",
            "fashion": "الأزياء",
            "fashion2": "الأزياء 2",
            "kitchen1": "أجهزة المطبخ",
            "kitchen2": "أواني الطبخ",
            "kitchen3": "أدوات المطبخ",
            "beauty1": "العناية بالبشرة",
            "beauty2": "مستحضرات التجميل",
            "beauty3": "العناية بالشعر",
            "food1": "الأطعمة العضوية",
            "food2": "المشروبات",
            "food3": "الوجبات الخفيفة",
            "device1": "أجهزة تتبع اللياقة",
            "device2": "أجهزة قياس ضغط الدم",
            "device3": "موازين الحرارة"
          },

          // Blog
          "blog": {
            "latestPosts": "أحدث المقالات",
            "tipsAndTricks": "نصائح وحيل"
          },

          // Cart
          "cart": {
            "empty": "سلة المشتريات فارغة",
            "loginRequired": "يرجى تسجيل الدخول لعرض سلة المشتريات",
            "orderSummary": "ملخص الطلب",
            "remove": "حذف",
            "applyDiscount": "تطبيق الخصم",
            "deliveryCharges": "رسوم التوصيل",
            "couponDiscount": "خصم الكوبون"
          },

          // Brands
          "brands": {
            "bhisma_organice": "بِهسما العضوي",
            "brand2": "يراند 2"
          },

          // Product Details
          "product": {
            "description": "الوصف",
            "specifications": "المواصفات",
            "reviews": "التقييمات",
            "relatedProducts": "منتجات ذات صلة",
            "inStock": "متوفر",
            "outOfStock": "غير متوفر",
            "quantity": "الكمية",
            "addToWishlist": "إضافة إلى المفضلة",
            "removeFromWishlist": "إزالة من المفضلة",
            "share": "مشاركة",
            "delivery": "التوصيل",
            "returns": "الإرجاع",
            "warranty": "الضمان"
          },

          // Checkout
          "checkout": {
            "loginRequired": "يرجى تسجيل الدخول للمتابعة",
            "billingDetails": "تفاصيل الفواتير",
            "checkoutOptions": "خيارات الدفع",
            "existingAddress": "أريد استخدام عنوان موجود",
            "newAddress": "أريد استخدام عنوان جديد",
            "selectAddress": "اختر عنواناً",
            "noSavedAddresses": "لم يتم العثور على عناوين محفوظة",
            "firstName": "الاسم الأول*",
            "lastName": "الاسم الأخير*",
            "email": "البريد الإلكتروني*",
            "phone": "رقم الهاتف*",
            "address": "العنوان*",
            "city": "المدينة*",
            "postalCode": "الرمز البريدي*",
            "country": "الدولة*",
            "regionState": "المنطقة/الولاية*",
            "firstNamePlaceholder": "أدخل اسمك الأول",
            "lastNamePlaceholder": "أدخل اسمك الأخير",
            "addressPlaceholder": "سطر العنوان 1",
            "postalCodePlaceholder": "الرمز البريدي",
            "selectCountry": "اختر الدولة",
            "selectState": "اختر الولاية",
            "selectCity": "اختر المدينة",
            "adding": "جاري الإضافة...",
            "addAddress": "إضافة العنوان",
            "processing": "جاري المعالجة...",
            "placeOrder": "تأكيد الطلب",
            "orderSummary": "ملخص الطلب",
            "deliveryMethod": "طريقة التوصيل",
            "deliveryMethodDescription": "يرجى اختيار طريقة الشحن المفضلة لهذا الطلب",
            "deliveryComments": "أضف تعليقات حول طلبك",
            "deliveryCommentsPlaceholder": "التعليقات",
            "paymentMethod": "طريقة الدفع",
            "paymentMethodDescription": "يرجى اختيار طريقة الدفع المفضلة لهذا الطلب",
            "paymentComments": "أضف تعليقات حول طلبك",
            "paymentCommentsPlaceholder": "التعليقات",
            "terms": "لقد قرأت ووافقت على الشروط والأحكام",
            "applyDiscount": "تطبيق الخصم",
            "standardDelivery": "توصيل عادي (5-7 أيام عمل)",
            "billingAddress": "عنوان الفاتورة",
            "shippingAddress": "عنوان الشحن",
            "paymentMethods": "طرق الدفع",
            "orderNotes": "ملاحظات الطلب",
            "termsAndConditions": "الشروط والأحكام",
            "placeOrder": "تأكيد الطلب",
            "cashOnDelivery": "الدفع عند الاستلام",
            "paypal": "باي بال",
            "creditCard": "بطاقة ائتمان"
          },

          // Hero Slider (Arabic)
          "hero": {
            "title": "طازج وصحي",
            "subtitle": "منتجات عضوية طبيعية",
            "description": "نقدم الخضروات والفواكه العضوية",
            "shopNow": "تسوق الآن",
            "learnMore": "اعرف المزيد",
            "discount": "خصم",
            "off": "٪",
            "newArrivals": "وصل حديثاً",
            "bestSellers": "الأكثر مبيعاً",
            "featuredProducts": "منتجات مميزة",
            "trendingProducts": "منتجات رائجة"
          },

          // Product Categories (Arabic)
          "productCategories": {
            "fruits": "فواكه طازجة",
            "vegetables": "خضروات طازجة",
            "meat": "لحوم طازجة",
            "seafood": "مأكولات بحرية طازجة",
            "dairy": "منتجات ألبان",
            "bakery": "منتجات مخبوزة",
            "beverages": "مشروبات",
            "snacks": "وجبات خفيفة",
            "organic": "منتجات عضوية",
            "spices": "توابل وأعشاب"
          }
        }
      }
    }
  });

export default i18n; 