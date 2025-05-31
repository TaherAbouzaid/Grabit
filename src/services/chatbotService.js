import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

// تحسين تعليمات النظام
const systemPrompt = `
أنت مساعد متجر إلكتروني مفيد ولطيف. دورك هو مساعدة العملاء في:
1. العثور على المنتجات المناسبة
2. الإجابة على أسئلة حول الطلبات والشحن
3. حل المشكلات البسيطة
4. تقديم معلومات عن سياسات المتجر

قدم إجابات موجزة ومفيدة لا تتجاوز 2-3 جمل. كن مهذبًا ولطيفًا دائمًا.
`;

// نظام احتياطي للردود البسيطة
const fallbackResponses = {
  greeting: [
    "مرحبًا! كيف يمكنني مساعدتك اليوم؟",
    "أهلاً بك في متجرنا! هل تبحث عن منتج معين؟",
  ],
  product: [
    "يمكنك تصفح منتجاتنا في صفحة المتجر. هل تبحث عن فئة معينة؟",
    "لدينا مجموعة متنوعة من المنتجات. يمكنك استخدام خاصية البحث للعثور على ما تحتاجه.",
  ],
  order: [
    "يمكنك متابعة طلبك من صفحة الطلبات في حسابك الشخصي.",
    "عادة ما تستغرق الطلبات من 3-5 أيام للتوصيل. هل تحتاج إلى مساعدة أخرى؟",
  ],
  default: [
    "عذرًا، لم أفهم طلبك. هل يمكنك توضيح ما تحتاجه؟",
    "يمكنك طرح سؤال آخر أو تصفح موقعنا للحصول على المزيد من المعلومات.",
  ],
};

// دالة للحصول على رد احتياطي بناءً على نوع الرسالة
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("مرحب") ||
    lowerMessage.includes("اهلا") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hello")
  ) {
    return fallbackResponses.greeting[
      Math.floor(Math.random() * fallbackResponses.greeting.length)
    ];
  }

  if (
    lowerMessage.includes("منتج") ||
    lowerMessage.includes("سلعة") ||
    lowerMessage.includes("بضاعة") ||
    lowerMessage.includes("product")
  ) {
    return fallbackResponses.product[
      Math.floor(Math.random() * fallbackResponses.product.length)
    ];
  }

  if (
    lowerMessage.includes("طلب") ||
    lowerMessage.includes("شحن") ||
    lowerMessage.includes("توصيل") ||
    lowerMessage.includes("order") ||
    lowerMessage.includes("delivery")
  ) {
    return fallbackResponses.order[
      Math.floor(Math.random() * fallbackResponses.order.length)
    ];
  }

  return fallbackResponses.default[
    Math.floor(Math.random() * fallbackResponses.default.length)
  ];
};

// دالة لتنسيق بيانات المنتج لعرضها في الشات بوت
export const formatProductForChatbot = (product) => {
  return {
    id: product.id,
    title: product.title,
    mainImage: product.mainImage,
    price: product.price,
    discountPrice: product.discountPrice,
    quantity: product.quantity,
  };
};

// دالة لإنشاء رسالة تحتوي على منتجات
export const createProductsMessage = (products, language = "ar") => {
  if (!products || products.length === 0) {
    return language === "ar"
      ? "لم أجد منتجات مطابقة لطلبك."
      : "I couldn't find products matching your request.";
  }

  const productsData = products.map((p) => formatProductForChatbot(p));

  // إنشاء نص الرسالة
  const messageText =
    language === "ar"
      ? `وجدت ${products.length} منتج${
          products.length > 1 ? "ات" : ""
        } قد تهمك:`
      : `I found ${products.length} product${
          products.length > 1 ? "s" : ""
        } that might interest you:`;

  // إرجاع كائن يحتوي على النص والمنتجات
  return {
    text: messageText,
    products: productsData,
  };
};

// تحسين دالة البحث عن المنتجات
export const searchProducts = async (
  query,
  limit = 5,
  categoryId = null,
  sortBy = null,
  detectedCategoryName = null
) => {
  try {
    console.log("Searching for products with query:", query);
    
    // تنظيف النص المدخل
    const cleanQuery = query
      .toLowerCase()
      .replace(/[^\w\sأ-ي]/g, "")
      .trim();
      
    console.log("Cleaned query:", cleanQuery);

    // الحصول على جميع المنتجات
    const productsRef = collection(db, "allproducts");
    let querySnapshot = await getDocs(productsRef);
    console.log("Total products fetched:", querySnapshot.docs.length);

    // تحويل المنتجات إلى مصفوفة
    let products = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        mainImage: data.mainImage,
        price: data.price,
        discountPrice: data.discountPrice,
        quantity: data.quantity,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        brandId: data.brandId,
        createdAt: data.createdAt,
      };
    });

    // فلترة حسب الفئة إذا تم تحديدها
    if (categoryId) {
      products = products.filter(product => 
        product.categoryId?.categoryId === categoryId
      );
    }
    
    // فلترة حسب اسم الفئة إذا تم تحديده
    if (detectedCategoryName) {
      products = products.filter(product => {
        const categoryNameAr = product.categoryId?.name?.ar?.toLowerCase() || "";
        const categoryNameEn = product.categoryId?.name?.en?.toLowerCase() || "";
        return categoryNameAr.includes(detectedCategoryName.toLowerCase()) || 
               categoryNameEn.includes(detectedCategoryName.toLowerCase());
      });
    }

    // تحديد الكلمات المفتاحية للبحث
    const searchTerms = cleanQuery.split(/\s+/).filter(term => term.length > 1);
    
    // تحديد الفئات والعلامات التجارية المحتملة
    const possibleCategories = [];
    const possibleBrands = [];
    
    // قائمة الكلمات المفتاحية للفئات
    const categoryKeywords = {
      laptops: ["laptop", "laptops", "notebook", "لابتوب", "حاسوب محمول", "كمبيوتر محمول"],
      phones: ["phone", "phones", "smartphone", "هاتف", "جوال", "موبايل"],
      tvs: ["tv", "television", "تلفزيون", "شاشة"],
      computers: ["computer", "pc", "desktop", "كمبيوتر", "حاسوب"],
      tablets: ["tablet", "ipad", "تابلت", "لوحي"],
      accessories: ["accessory", "accessories", "ملحقات", "اكسسوارات"]
    };
    
    // قائمة الكلمات المفتاحية للعلامات التجارية
    const brandKeywords = {
      apple: ["apple", "iphone", "ipad", "macbook", "airpods", "أبل", "ايفون", "ايباد", "ماك"],
      samsung: ["samsung", "galaxy", "سامسونج", "جالاكسي"],
      hp: ["hp", "pavilion", "envy", "spectre", "elitebook", "اتش بي"],
      sony: ["sony", "playstation", "سوني", "بلايستيشن"],
      dell: ["dell", "xps", "inspiron", "alienware", "ديل"],
      microsoft: ["microsoft", "surface", "xbox", "مايكروسوفت", "اكس بوكس"],
      lg: ["lg", "ال جي"]
    };
    
    // تحديد الفئات والعلامات التجارية من الكلمات المفتاحية
    for (const term of searchTerms) {
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.includes(term) || category === term) {
          possibleCategories.push(category);
        }
      }
      
      for (const [brand, keywords] of Object.entries(brandKeywords)) {
        if (keywords.includes(term) || brand === term) {
          possibleBrands.push(brand);
        }
      }
    }
    
    // تحديد نوع البحث
    let isLatestSearch = cleanQuery.includes("latest") || 
                        cleanQuery.includes("new") || 
                        cleanQuery.includes("أحدث") || 
                        cleanQuery.includes("جديد");
                        
    let isDiscountSearch = cleanQuery.includes("offers") || 
                          cleanQuery.includes("discount") || 
                          cleanQuery.includes("عروض") || 
                          cleanQuery.includes("خصم") || 
                          cleanQuery.includes("تخفيضات");
    
    // فلترة المنتجات
    let filteredProducts = products;
    
    // فلترة حسب الفئة والعلامة التجارية
    if (possibleCategories.length > 0 || possibleBrands.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const titleAr = (product.title?.ar || "").toLowerCase();
        const titleEn = (product.title?.en || "").toLowerCase();
        const descAr = (product.description?.ar || "").toLowerCase();
        const descEn = (product.description?.en || "").toLowerCase();
        
        let categoryMatch = possibleCategories.length === 0; // إذا لم يتم تحديد فئة، فالتطابق صحيح
        let brandMatch = possibleBrands.length === 0; // إذا لم يتم تحديد علامة تجارية، فالتطابق صحيح
        
        // التحقق من تطابق الفئة
        if (possibleCategories.length > 0) {
          categoryMatch = possibleCategories.some(category => {
            const categoryTerms = categoryKeywords[category] || [];
            return categoryTerms.some(term => 
              titleAr.includes(term) || 
              titleEn.includes(term) || 
              descAr.includes(term) || 
              descEn.includes(term)
            );
          });
        }
        
        // التحقق من تطابق العلامة التجارية
        if (possibleBrands.length > 0) {
          brandMatch = possibleBrands.some(brand => {
            const brandTerms = brandKeywords[brand] || [];
            return brandTerms.some(term => 
              titleAr.includes(term) || 
              titleEn.includes(term) || 
              descAr.includes(term) || 
              descEn.includes(term)
            );
          });
        }
        
        return categoryMatch && brandMatch;
      });
    }
    
    // استخدام sortBy للترتيب
    if (sortBy === "latest" || isLatestSearch) {
      // ترتيب المنتجات حسب تاريخ الإنشاء (الأحدث أولاً)
      filteredProducts.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    } else if (sortBy === "discount" || isDiscountSearch) {
      // فلترة حسب الخصومات
      filteredProducts = filteredProducts.filter(
        product => product.discountPrice && product.discountPrice < product.price
      );
      
      // ترتيب حسب نسبة الخصم
      filteredProducts.sort((a, b) => {
        const aDiscount = (a.price - a.discountPrice) / a.price;
        const bDiscount = (b.price - b.discountPrice) / b.price;
        return bDiscount - aDiscount;
      });
    } else if (sortBy === "cheapest_discounted") {
      // فلترة المنتجات المخفضة فقط
      filteredProducts = filteredProducts.filter(
        product => product.discountPrice && product.discountPrice < product.price
      );
      
      // ترتيب حسب السعر بعد الخصم (الأرخص أولاً)
      filteredProducts.sort((a, b) => {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      });
    }
    
    // إذا لم يتم العثور على منتجات، ابحث في عناوين وأوصاف المنتجات
    if (filteredProducts.length === 0 && searchTerms.length > 0) {
      filteredProducts = products.filter(product => {
        const titleAr = (product.title?.ar || "").toLowerCase();
        const titleEn = (product.title?.en || "").toLowerCase();
        const descAr = (product.description?.ar || "").toLowerCase();
        const descEn = (product.description?.en || "").toLowerCase();
        
        return searchTerms.some(term => 
          titleAr.includes(term) || 
          titleEn.includes(term) || 
          descAr.includes(term) || 
          descEn.includes(term)
        );
      });
    }
    
    // إذا لم يتم العثور على منتجات، أعد أحدث المنتجات
    if (filteredProducts.length === 0) {
      filteredProducts = products.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    }
    
    // تطبيق الحد الأقصى للنتائج
    return filteredProducts.slice(0, limit);
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

export const getChatbotResponseWithHistory = async (
  userMessage,
  conversationHistory,
  userId
) => {
  try {
    // بناء سلسلة الرسائل مع تاريخ المحادثة
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // طباعة معلومات التصحيح
    console.log("API Key exists:", !!import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log(
      "API Key length:",
      import.meta.env.VITE_OPENROUTER_API_KEY?.length || 0
    );

    // التحقق من وجود مفتاح API
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      console.error("OpenAI API key is missing");
      return "عذرًا، هناك خطأ في إعدادات الخادم. يرجى الاتصال بمسؤول النظام.";
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://your-site.com", // غرها لموقعك أو localhost
          "X-Title": "Ecommerce Chat Assistant",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // متاح عبر OpenRouter
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      }
    );

    // التحقق من حالة الاستجابة
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);

      // معالجة أنواع مختلفة من أخطاء API
      if (response.status === 401) {
        return "عذرًا، هناك مشكلة في المصادقة مع خدمة الذكاء الاصطناعي.";
      } else if (response.status === 429) {
        return "عذرًا، تم تجاوز حد الاستخدام لخدمة الذكاء الاصطناعي. حاول مرة أخرى لاحقًا.";
      } else if (response.status >= 500) {
        return "عذرًا، هناك مشكلة في خدمة الذكاء الاصطناعي. حاول مرة أخرى لاحقًا.";
      }

      return "عذرًا، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.";
    }

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API error in response:", data.error);
      return "عذرًا، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.";
    }

    // التحقق من وجود الاستجابة المتوقعة
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response format:", data);
      return "عذرًا، تلقينا استجابة غير متوقعة من خدمة الذكاء الاصطناعي.";
    }

    const botResponse = data.choices[0].message.content;

    // حفظ المحادثة في Firestore
    if (userId) {
      try {
        await addDoc(collection(db, "chatConversations"), {
          userId,
          userMessage,
          botResponse,
          timestamp: serverTimestamp(),
        });
      } catch (dbError) {
        console.error("Error saving conversation to Firestore:", dbError);
        // لا نعيد خطأ للمستخدم هنا لأن المحادثة نجحت، فقط فشل التخزين
      }
    }

    return botResponse;
  } catch (error) {
    console.error("Error in chatbot service, using fallback:", error);

    // استخدام النظام الاحتياطي
    const fallbackResponse = getFallbackResponse(userMessage);

    // حفظ المحادثة في Firestore إذا أمكن
    if (userId) {
      try {
        await addDoc(collection(db, "chatConversations"), {
          userId,
          userMessage,
          botResponse: fallbackResponse,
          timestamp: serverTimestamp(),
          isFailover: true, // علامة لتوضيح أن هذا رد احتياطي
        });
      } catch (dbError) {
        console.error(
          "Error saving fallback conversation to Firestore:",
          dbError
        );
      }
    }

    return fallbackResponse;
  }
};
