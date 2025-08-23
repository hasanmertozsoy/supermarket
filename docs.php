<!DOCTYPE html>
<html lang="tr" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cimri Market API Dokümantasyonu</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-900">
    <div class="max-w-3xl mx-auto px-4 py-16">
        <!-- Header -->
        <header class="mb-16">
            <h1 class="text-4xl font-bold mb-4">Cimri Market API</h1>
            <p class="text-lg text-gray-600">
                Cimri.com market ürünlerini programatik olarak arayın, fiyatları karşılaştırın ve en uygun fiyatları bulun.
            </p>
        </header>

        <!-- Ana Endpoint -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-4">API Endpoint</h2>
            <div class="bg-white p-4 rounded-lg border border-gray-200">
                <code class="text-blue-600">/api.php</code>
            </div>
        </section>

        <!-- Parametreler -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-4">Parametreler</h2>
            <div class="space-y-4">
                <!-- q parametresi -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <div class="flex items-start gap-4">
                        <div>
                            <code class="bg-gray-100 px-2 py-1 rounded text-sm">q</code>
                            <span class="ml-2 text-red-600 text-sm font-medium">zorunlu</span>
                            <p class="mt-2 text-gray-600">Arama sorgusu (örn: seker, sut, ekmek)</p>
                        </div>
                    </div>
                </div>

                <!-- sort parametresi -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <div class="flex items-start gap-4">
                        <div>
                            <code class="bg-gray-100 px-2 py-1 rounded text-sm">sort</code>
                            <span class="ml-2 text-blue-600 text-sm font-medium">opsiyonel</span>
                            <p class="mt-2 text-gray-600">Sıralama kriteri</p>
                            <div class="mt-3 space-y-2">
                                <div class="flex items-center gap-2">
                                    <code class="bg-gray-100 px-2 py-1 rounded text-sm">price-asc</code>
                                    <span class="text-gray-600">En düşük fiyat</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <code class="bg-gray-100 px-2 py-1 rounded text-sm">specUnit-asc</code>
                                    <span class="text-gray-600">En düşük birim fiyat</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- page parametresi -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <div class="flex items-start gap-4">
                        <div>
                            <code class="bg-gray-100 px-2 py-1 rounded text-sm">page</code>
                            <span class="ml-2 text-blue-600 text-sm font-medium">opsiyonel</span>
                            <p class="mt-2 text-gray-600">Sayfa numarası (varsayılan: 1)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Örnek İstekler -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-4">Örnek İstekler</h2>
            <div class="space-y-4">
                <!-- Temel Arama -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="font-medium mb-3">Temel Arama</h3>
                    <code class="block bg-gray-100 p-3 rounded">/api.php?q=seker</code>
                </div>

                <!-- Sıralama ile -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="font-medium mb-3">Sıralama ile</h3>
                    <code class="block bg-gray-100 p-3 rounded">/api.php?q=seker&sort=price-asc</code>
                </div>

                <!-- Sayfalama ile -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 class="font-medium mb-3">Sayfalama ile</h3>
                    <code class="block bg-gray-100 p-3 rounded">/api.php?q=seker&page=2</code>
                </div>
            </div>
        </section>

        <!-- Test Aracı -->
        <section>
            <h2 class="text-2xl font-semibold mb-4">API'yi Test Et</h2>
            <div class="bg-white p-6 rounded-lg border border-gray-200">
                <form id="apiForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Arama Sorgusu</label>
                        <input
                            type="text"
                            name="q"
                            placeholder="Örnek: seker"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                            <select
                                name="sort"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sıralama seçin</option>
                                <option value="price-asc">En düşük fiyat</option>
                                <option value="specUnit-asc">En düşük birim fiyat</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sayfa</label>
                            <input
                                type="number"
                                name="page"
                                value="1"
                                min="1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        API'yi Test Et
                    </button>
                </form>

                <div id="result" class="mt-6">
                    <pre class="hidden bg-gray-100 p-4 rounded-md overflow-x-auto text-sm"></pre>
                </div>
            </div>
        </section>
    </div>

    <script>
    document.getElementById('apiForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const query = form.q.value;
        const page = form.page.value;
        const sort = form.sort.value;
        const button = form.querySelector('button');
        const resultPre = document.querySelector('#result pre');

        // Loading durumu
        button.disabled = true;
        button.innerHTML = 'Yükleniyor...';
        resultPre.classList.remove('hidden');
        resultPre.textContent = 'Yükleniyor...';

        try {
            let url = `/api.php?q=${encodeURIComponent(query)}`;
            if (sort) url += `&sort=${sort}`;
            if (page > 1) url += `&page=${page}`;

            const response = await fetch(url);
            const data = await response.json();
            resultPre.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            resultPre.textContent = 'Hata: ' + error.message;
        } finally {
            button.disabled = false;
            button.textContent = 'API\'yi Test Et';
        }
    });
    </script>
</body>
</html>
?>
