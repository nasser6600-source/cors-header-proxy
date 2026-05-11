export default {
	async fetch(request): Promise<Response> {
		const corsHeaders = {
			"Access-Control-Allow-Origin": request.url.origin,
			"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
			"Access-Control-Max-Age": "86400",
		};

		// The URL for the remote third party API you want to fetch from
		// but does not implement CORS
		const API_URL = "https://examples.cloudflareworkers.com/demos/demoapi";

		// The endpoint you want the CORS reverse proxy to be on
		const PROXY_ENDPOINT = "/corsproxy/";

		// The rest of this snippet for the demo page
		function rawHtmlResponse(html) {
			return new Response(html, {
				headers: {
					"content-type": "text/html;charset=UTF-8",
				},
			});
		}

		const DEMO_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React CDN Starter</title>
    
    <!-- React and ReactDOM (Development Versions) -->
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    
    <!-- Babel to compile JSX on the fly -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
    body, html {
        margin: 0;
        padding: 0;
        background: #020408;
        /* Allow the body to scroll normally */
        overflow-y: auto; 
        min-height: 100vh;
    }
    
    /* Smooth scrolling for the whole page */
    html {
        scroll-behavior: smooth;
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #020408; }
    ::-webkit-scrollbar-thumb { background: #112233; border-radius: 10px; border: 1px solid #00aaff; }
</style>
</head>
<body>

    <div id="root"></div>

    <!-- Note: type="text/babel" is required for Babel to process this script -->
    <script type="text/babel">
        const {useEffect, useRef, useState} = React;
function HormuzAgent() {

  const [alerts, setAlerts] = useState([]);

  const [isMonitoring, setIsMonitoring] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [intervalSecs, setIntervalSecs] = useState(5); // الافتراضي 5 ثواني



  const intervalRef = useRef(null);

  const timerRef = useRef(null);



  const LIVE_NEWS = [

    {

      title: "🔴 عاجل: توتر جديد في مضيق هرمز",

      level: "critical",

      body: "إيران تعلن عن مناورات عسكرية كبيرة قرب المضيق.",

      impact: "أدنوك ترفع حالة الطوارئ",

    },

    {

      title: "ناقلات أدنوك تتحرك بسرية عبر هرمز",

      level: "high",

      body: "تم إيقاف أجهزة التتبع في عدة ناقلات إماراتية.",

      impact: "ارتفاع أسعار النفط",

    },

    {

      title: "الإمارات تدعو لاجتماع طارئ خليجي",

      level: "high",

      body: "لمناقشة التهديدات الأمنية في مضيق هرمز.",

      impact: "تنسيق خليجي مشترك",

    },

    {

      title: "أمريكا ترسل تعزيزات بحرية جديدة",

      level: "medium",

      body: "نشر حاملة طائرات إضافية في الخليج.",

      impact: "دعم أمريكي مباشر",

    },

  ];



  const getLiveTime = (timestamp) => {

    const diff = Math.floor((Date.now() - timestamp) / 60000);

    if (diff < 1) return "منذ لحظات";

    if (diff < 60) return "منذ "+diff+" دقيقة";

    return "منذ "+Math.floor(diff / 60)+" ساعة";

  };
const fetchLiveNews = async () => {
  const PROXY = "https://proxy.corsfix.com/?";
  
  // 1. Define multiple sources
  const FEEDS = [
  // BBC Arabic - Excellent for verified high-level regional news
  { name: "بي بي سي عربي", url: "https://www.bbc.com/arabic/index.xml" },
  
  // Al Jazeera Arabic - Usually the fastest for breaking "Urgent" news in the Gulf
  { name: "الجزيرة", url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db13f2dcc/6643e0e6-863f-4596-b870-025c919a3410" },
  
  // Al Arabiya - Strong coverage of UAE/Saudi maritime security and IRGC movements
  { name: "الأيام", url: "https://feeds.feedburner.com/alayam-online-international-news" },
  
  // Sky News Arabia - Highly relevant for UAE-specific security alerts
  { name: "سكاي نيوز", url: "https://www.skynewsarabia.com/rss/v1/middle-east.xml" },
  
  // Asharq Al-Awsat - Deep geopolitical analysis and Iran-related updates
  { name: "الشرق الأوسط", url: "https://aawsat.com/feed/gulf" },
  
  // MEED (Arabic/Regional) - Keep the original MEED links if you want economic data, 
  // as they are the primary source for Gulf project and oil infrastructure news.
  { name: "ميد (إيران)", url: "https://www.meed.com/countries/iran/rss/feed" }
];

  const keywords = ["Hormuz", "Iran", "Tanker", "Gulf", "Ship", "Navy", "هرمز", "ناقلة", "مضيق", "ايران", "بحرية","سفينة","إيران"];

  try {
	const d24 = new Date(new Date().setDate(new Date().getDate() -1));
    let allNewAlerts = [];

    // 2. Query all sources in parallel
    const feedPromises = FEEDS.map(async (feed) => {
      try {
        const response = await fetch(PROXY+(feed.url),{
			headers:{
				"x-corsfix-key":"cfx_dd1e26ee2f2efb0ad3028b3cd55d3ef0"
			}
		});
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const items = Array.from(xmlDoc.getElementsByTagName("item"));

        return items.map(item => ({
          title: item.getElementsByTagName("title")[0]?.textContent,
          description: item.getElementsByTagName("description")[0]?.textContent,
          link: item.getElementsByTagName("link")[0]?.textContent,
          pubDate: item.getElementsByTagName("pubDate")[0]?.textContent,
          sourceName: feed.name
        }));
      } catch (e) {
        console.error("Error fetching "+feed.name+":", e);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const combinedNews = results.flat();

    // 3. Filter by keywords and format
    const filteredNews = combinedNews.filter(news =>
      keywords.some(k => 
        (news.title + news.description).toLowerCase().includes(k.toLowerCase())
      )
	  && news.timestamp > d24
    );

    // 4. Update state with duplicate prevention
    setAlerts(prevAlerts => {
      const newEntries = [];

      filteredNews.forEach(news => {
        // Check if the news link already exists in the current alerts
        const isDuplicate = prevAlerts.some(alert => alert.url === news.link) || 
                           newEntries.some(entry => entry.url === news.link);

        if (!isDuplicate) {
          const timestamp = news.pubDate ? new Date(news.pubDate).getTime() : Date.now();
          const level = 1; // analyzeGeopolitics(news.title);

          newEntries.push({
            id: news.link, // Using URL as a unique ID
            timestamp,
            title: news.title,
            body: news.description,
            level: level,
            impact: "تحديث من "+news.sourceName,
            url: news.link,
            time: new Date(timestamp).toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),
            date: new Date(timestamp).toLocaleDateString("ar-AE"),
          });
        }
      });
      if (newEntries.length > 0) {
        // Play sound for the most critical of the new batch
        playSound(1); 
        // Combine, sort by newest first, and limit to 12
        return [...newEntries, ...prevAlerts]
          .sort((a, b) => b.timestamp - a.timestamp);
//	.filter((a,b) => a.timestamp > d24);
//          .slice(0, 12);
      }

      return prevAlerts;
    });

  } catch (error) {
    console.error("Global RSS Fetch Error:", error);
  }
};

  const playSound = (level) => {

    if (!soundEnabled) return;

    try {

      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const osc = ctx.createOscillator();

      osc.type = level === "critical" ? "sawtooth" : "sine";

      osc.frequency.value = level === "critical" ? 180 : 800;

      osc.connect(ctx.destination);

      osc.start();

      setTimeout(() => osc.stop(), 600);

    } catch (e) {}

  };



  const addNewAlert = () => {

    const news = LIVE_NEWS[Math.floor(Math.random() * LIVE_NEWS.length)];

    const timestamp = Date.now();



    const newAlert = {

      id: timestamp,

      timestamp,

      title: news.title,

      body: news.body,

      level: news.level,

      impact: news.impact,

      time: new Date(timestamp).toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }),

      date: new Date(timestamp).toLocaleDateString("ar-AE"),

    };



    setAlerts(prev => [newAlert, ...prev].slice(0, 12));

    playSound(news.level);

  };



  const toggleMonitoring = () => {

    if (isMonitoring) {

      clearInterval(intervalRef.current);

      setIsMonitoring(false);

    } else {

      setIsMonitoring(true);

      fetchLiveNews();

      intervalRef.current = setInterval(fetchLiveNews, intervalSecs * 1000);

    }

  };



  // تحديث الفاصل الزمني أثناء التشغيل

  useEffect(() => {

    if (isMonitoring) {

      clearInterval(intervalRef.current);

      intervalRef.current = setInterval(fetchLiveNews, intervalSecs * 1000);

    }

  }, [intervalSecs, isMonitoring]);



  // تحديث الوقت (منذ ...)

  useEffect(() => {

    timerRef.current = setInterval(() => setAlerts(p => [...p]), 60000);

    return () => {

      clearInterval(intervalRef.current);

      clearInterval(timerRef.current);

    };

  }, []);



  return (

    <div style={{

      minHeight: "100vh",

      background: "#020408",

      color: "#e0e8f0",

      padding: "20px",

      fontFamily: "Arial, sans-serif",

      direction: "rtl"

    }}>

      <h1 style={{ textAlign: "center", color: "#00e5ff" }}>🛡️ وكيل هرمز — مراقبة لحظية</h1>

      <p style={{ textAlign: "center", color: "#00ff88", marginBottom: "25px" }}>

        الأخبار تتحدث الآن

      </p>



      <div style={{ textAlign: "center", marginBottom: "30px" }}>

        <button

          onClick={toggleMonitoring}

          style={{

            padding: "14px 35px",

            fontSize: "17px",

            background: isMonitoring ? "#aa0000" : "#008800",

            color: "white",

            border: "none",

            borderRadius: "8px",

            cursor: "pointer",

            margin: "0 10px"

          }}

        >

          {isMonitoring ? "⏹ إيقاف" : "▶ بدء المراقبة"}

        </button>



        <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ padding: "14px 18px", fontSize: "17px" }}>

          {soundEnabled ? "🔊" : "🔇"}

        </button>



        <button onClick={addNewAlert} style={{ padding: "14px 20px", fontSize: "16px" }}>

          تنبيه يدوي

        </button>

      </div>



      {/* تحكم الفاصل الزمني */}

      <div style={{ textAlign: "center", marginBottom: "30px" }}>

        <span style={{ marginLeft: "10px" }}>الفاصل الزمني:</span>

        <select

          value={intervalSecs}

          onChange={(e) => setIntervalSecs(Number(e.target.value))}

          style={{ padding: "10px 15px", fontSize: "16px", borderRadius: "6px", background: "#112233", color: "white", border: "1px solid #00aaff" }}

        >

          <option value={3}>3 ثواني</option>

          <option value={5}>5 ثواني</option>

          <option value={8}>8 ثواني</option>

          <option value={12}>12 ثانية</option>

          <option value={20}>20 ثانية</option>

          <option value={30}>30 ثانية</option>

          <option value={60}>60 ثانية (دقيقة)</option>

        </select>

      </div>



      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {alerts.map((alert) => (

          <div

            key={alert.id}

            style={{

              background: alert.level === "critical" ? "#180000" : "#181000",

              borderRight: "6px solid "+alert.level === "critical" ? "#ff2d2d" : "#ff8c00",

              padding: "18px 20px",

              marginBottom: "16px",

              borderRadius: "10px",

            }}

          >

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>

              <strong style={{ color: alert.level === "critical" ? "#ff2d2d" : "#ff8c00" }}>

                {alert.level === "critical" ? "● حرج" : "● مرتفع"}

              </strong>

              <span style={{ color: "#aaa" }}>

                {alert.time} - {alert.date} • {getLiveTime(alert.timestamp)}

              </span>

            </div>

            <h3>{alert.title}</h3>

            <p>{alert.body}</p>

            <div style={{ color: "#ffd700" }}>⚡ {alert.impact}</div>

          </div>

        ))}



        {alerts.length === 0 && (

          <div style={{ textAlign: "center", padding: "100px 20px", opacity: 0.6 }}>

            اختر الفاصل الزمني ثم اضغط "بدء المراقبة"

          </div>

        )}

      </div>

    </div>

  );

}


        // Get the root element and render the component
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(<HormuzAgent />);

    </script>
</body>
</html>`;

		async function handleRequest(request) {
			const url = new URL(request.url);
			let apiUrl = url.searchParams.get("apiurl");

			if (apiUrl == null) {
				apiUrl = API_URL;
			}

			// Rewrite request to point to API URL. This also makes the request mutable
			// so you can add the correct Origin header to make the API server think
			// that this request is not cross-site.
			request = new Request(apiUrl, request);
			request.headers.set("Origin", new URL(apiUrl).origin);
			let response = await fetch(request);
			// Recreate the response so you can modify the headers

			response = new Response(response.body, response);
			// Set CORS headers

			response.headers.set("Access-Control-Allow-Origin", url.origin);

			// Append to/Add Vary header so browser will cache response correctly
			response.headers.append("Vary", "Origin");

			return response;
		}

		async function handleOptions(request) {
			if (
				request.headers.get("Origin") !== null &&
				request.headers.get("Access-Control-Request-Method") !== null &&
				request.headers.get("Access-Control-Request-Headers") !== null
			) {
				// Handle CORS preflight requests.
				return new Response(null, {
					headers: {
						...corsHeaders,
						"Access-Control-Allow-Headers": request.headers.get(
							"Access-Control-Request-Headers",
						),
					},
				});
			} else {
				// Handle standard OPTIONS request.
				return new Response(null, {
					headers: {
						Allow: "GET, HEAD, POST, OPTIONS",
					},
				});
			}
		}

		const url = new URL(request.url);
		if (url.pathname.startsWith(PROXY_ENDPOINT)) {
			if (request.method === "OPTIONS") {
				// Handle CORS preflight requests
				return handleOptions(request);
			} else if (
				request.method === "GET" ||
				request.method === "HEAD" ||
				request.method === "POST"
			) {
				// Handle requests to the API server
				return handleRequest(request);
			} else {
				return new Response(null, {
					status: 405,
					statusText: "Method Not Allowed",
				});
			}
		} else {
			return rawHtmlResponse(DEMO_PAGE);
		}
	},
} satisfies ExportedHandler;
