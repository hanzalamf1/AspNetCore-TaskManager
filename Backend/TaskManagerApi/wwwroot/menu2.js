// menu2.js

(function() {
    // --- Mock Data ---
    const mockData = {
        button: Array.from({length: 37}, (_, i) => ({
            date: `2024-07-1${Math.floor(i/5)+1} 10:${(i%60).toString().padStart(2,'0')}`,
            name: `Buton ${i+1}`,
            type: i%2===0 ? 'Yuvarlak' : 'Kare',
            color: i%3===0 ? 'Kırmızı' : (i%3===1 ? 'Mavi' : 'Yeşil'),
            price: (5 + i%10) + ' TL',
        })),
        laptop: Array.from({length: 25}, (_, i) => ({
            date: `2024-07-1${Math.floor(i/5)+1} 11:${(i%60).toString().padStart(2,'0')}`,
            name: `Laptop ${i+1}`,
            model: `Model-${1000+i}`,
            color: i%2===0 ? 'Gri' : 'Siyah',
            price: (10000 + i*250) + ' TL',
            cpu: i%2===0 ? 'i5' : 'i7',
        })),
        tablet: Array.from({length: 12}, (_, i) => ({
            date: `2024-07-1${Math.floor(i/5)+1} 12:${(i%60).toString().padStart(2,'0')}`,
            name: `Tablet ${i+1}`,
            model: `Tab-${200+i}`,
            color: i%2===0 ? 'Beyaz' : 'Siyah',
            price: (3000 + i*100) + ' TL',
            screen: i%2===0 ? '10.1"' : '8.0"',
        })),
        car: Array.from({length: 8}, (_, i) => ({
            date: `2024-07-1${Math.floor(i/5)+1} 13:${(i%60).toString().padStart(2,'0')}`,
            name: `Araç ${i+1}`,
            model: `CAR-${i+1}`,
            color: i%2===0 ? 'Beyaz' : 'Kırmızı',
            price: (500000 + i*25000) + ' TL',
            year: 2015 + i,
        })),
        phone: Array.from({length: 19}, (_, i) => ({
            date: `2024-07-1${Math.floor(i/5)+1} 14:${(i%60).toString().padStart(2,'0')}`,
            name: `Telefon ${i+1}`,
            model: `P${i+1}`,
            color: i%2===0 ? 'Siyah' : 'Mavi',
            price: (8000 + i*200) + ' TL',
            storage: i%2===0 ? '128GB' : '256GB',
        })),
        shopping: Array.from({length: 22}, (_, i) => ({
            date: `2024-07-1${Math.floor(i/5)+1} 15:${(i%60).toString().padStart(2,'0')}`,
            name: `Ürün ${i+1}`,
            category: i%2===0 ? 'Giyim' : 'Elektronik',
            price: (100 + i*10) + ' TL',
            status: i%2===0 ? 'Teslim Edildi' : 'Hazırlanıyor',
        })),
    };

    // --- Table/Filter Config ---
    const categoryConfig = {
        button: {
            columns: [
                // {key:'date', label:'Tarih/Saat'},
                {key:'name', label:'Adı'},
                {key:'type', label:'Tip'},
                {key:'color', label:'Renk'},
                {key:'price', label:'Fiyat'},
            ],
            filters: [
                {key:'color', label:'Renk', type:'select', options:['Tümü','Kırmızı','Mavi','Yeşil']},
                {key:'type', label:'Tip', type:'select', options:['Tümü','Yuvarlak','Kare']},
            ]
        },
        laptop: {
            columns: [
                // {key:'date', label:'Tarih/Saat'},
                {key:'name', label:'Adı'},
                {key:'model', label:'Model'},
                {key:'color', label:'Renk'},
                {key:'cpu', label:'İşlemci'},
                {key:'price', label:'Fiyat'},
            ],
            filters: [
                {key:'color', label:'Renk', type:'select', options:['Tümü','Gri','Siyah']},
                {key:'cpu', label:'İşlemci', type:'select', options:['Tümü','i5','i7']},
            ]
        },
        tablet: {
            columns: [
                // {key:'date', label:'Tarih/Saat'},
                {key:'name', label:'Adı'},
                {key:'model', label:'Model'},
                {key:'color', label:'Renk'},
                {key:'screen', label:'Ekran'},
                {key:'price', label:'Fiyat'},
            ],
            filters: [
                {key:'color', label:'Renk', type:'select', options:['Tümü','Beyaz','Siyah']},
                {key:'screen', label:'Ekran', type:'select', options:['Tümü','10.1"','8.0"']},
            ]
        },
        car: {
            columns: [
                // {key:'date', label:'Tarih/Saat'},
                {key:'name', label:'Adı'},
                {key:'model', label:'Model'},
                {key:'color', label:'Renk'},
                {key:'year', label:'Yıl'},
                {key:'price', label:'Fiyat'},
            ],
            filters: [
                {key:'color', label:'Renk', type:'select', options:['Tümü','Beyaz','Kırmızı']},
                {key:'year', label:'Yıl', type:'select', options:['Tümü',2015,2016,2017,2018,2019,2020,2021,2022]}
            ]
        },
        phone: {
            columns: [
                // {key:'date', label:'Tarih/Saat'},
                {key:'name', label:'Adı'},
                {key:'model', label:'Model'},
                {key:'color', label:'Renk'},
                {key:'storage', label:'Depolama'},
                {key:'price', label:'Fiyat'},
            ],
            filters: [
                {key:'color', label:'Renk', type:'select', options:['Tümü','Siyah','Mavi']},
                {key:'storage', label:'Depolama', type:'select', options:['Tümü','128GB','256GB']},
            ]
        },
        shopping: {
            columns: [
                // {key:'date', label:'Tarih/Saat'},
                {key:'name', label:'Adı'},
                {key:'category', label:'Kategori'},
                {key:'status', label:'Durum'},
                {key:'price', label:'Fiyat'},
            ],
            filters: [
                {key:'category', label:'Kategori', type:'select', options:['Tümü','Giyim','Elektronik']},
                {key:'status', label:'Durum', type:'select', options:['Tümü','Teslim Edildi','Hazırlanıyor']},
            ]
        },
    };

    // --- API endpoint eşlemesi ---
    const apiMap = {
        button: {
            list: '/api/menu2/GetButtons',
        },
        laptop: {
            list: '/api/menu2/GetLaptops',
        },
        tablet: {
            list: '/api/menu2/GetTablets',
        },
        car: {
            list: '/api/menu2/GetCars',
        },
        phone: {
            list: '/api/menu2/GetPhones',
        },
        shopping: {
            list: '/api/menu2/GetShoppings',
        },
    };

    // Select2 yüklemesi
    function loadSelect2() {
        if (window.$ && $.fn.select2) {
            document.querySelectorAll('.select2').forEach(el => {
                $(el).select2({
                    width: 'resolve',
                    theme: 'bootstrap-5',
                    placeholder: 'Seçiniz',
                    allowClear: true,
                    closeOnSelect: false
                });
            });
        }
    }

    // --- Dinamik filtre endpoint eşlemesi ---
    const filterApiMap = {
        button: '/api/menu2/GetButtonFilters',
        laptop: '/api/menu2/GetLaptopFilters',
        tablet: '/api/menu2/GetTabletFilters',
        car: '/api/menu2/GetCarFilters',
        phone: '/api/menu2/GetPhoneFilters',
        shopping: '/api/menu2/GetShoppingFilters',
    };

    // --- Query endpoint eşlemesi ---
    const queryApiMap = {
        button: '/api/menu2/QueryButtons',
        laptop: '/api/menu2/QueryLaptops',
        tablet: '/api/menu2/QueryTablets',
        car: '/api/menu2/QueryCars',
        phone: '/api/menu2/QueryPhones',
        shopping: '/api/menu2/QueryShoppings',
    };

    // --- State ---
    let currentCategory = 'button';
    let currentPage = 1;
    let currentFilters = {};
    let pageSize = 20;
    let allData = [];

    // --- Dinamik filtre verisi ---
    let dynamicFilters = {};

    // --- DOM Elements ---
    const table = document.getElementById('dynamicTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const filterRow = document.getElementById('filterRow');
    const paginationControls = document.getElementById('paginationControls');
    const paginationInfo = document.getElementById('paginationInfo');
    const categoryButtons = document.getElementById('categoryButtons');

    // --- Helpers ---
    function showLoading() {
        tbody.innerHTML = `<tr><td colspan="${categoryConfig[currentCategory].columns.length}" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></td></tr>`;
    }
    function renderTable(data) {
        // Header
        thead.innerHTML = '<tr>' + categoryConfig[currentCategory].columns.map(col => `<th>${col.label}</th>`).join('') + '</tr>';
        // Body
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${categoryConfig[currentCategory].columns.length}" class="text-center">Kayıt bulunamadı.</td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(row =>
            '<tr>' + categoryConfig[currentCategory].columns.map(col => {
                let val = row[col.key] ?? '';
                if(col.key === 'price') {
                    // Eğer değer zaten TL içeriyorsa ekleme, değilse ekle
                    if(typeof val === 'number' || /^\d+(\.\d+)?$/.test(val)) {
                        val = parseFloat(val).toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' TL';
                    } else if(typeof val === 'string' && !val.includes('TL') && !val.includes('₺')) {
                        val = val + ' TL';
                    }
                }
                return `<td>${val}</td>`;
            }).join('') + '</tr>'
        ).join('');
    }
    // --- Yeni: Sidebar filtreleme ---
    async function renderSidebarFilters() {
        const sidebar = document.getElementById('filterSidebar');
        sidebar.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
        // Filtre verisini backend'den çek
        try {
            const res = await fetch(filterApiMap[currentCategory]);
            if (!res.ok) throw new Error('Filtreler yüklenemedi');
            dynamicFilters = await res.json();
        } catch {
            sidebar.innerHTML = '<div class="text-danger text-center">Filtreler yüklenemedi.</div>';
            return;
        }
        sidebar.innerHTML = '';
        // Her filtre için kutu oluştur
        Object.entries(dynamicFilters).forEach(([key, filter]) => {
            const group = document.createElement('div');
            group.className = 'filter-group';
            // Başlık
            const title = document.createElement('div');
            title.className = 'filter-title';
            title.textContent = filter.label;
            group.appendChild(title);
            // Fiyat aralığı
            if(key === 'price') {
                const minInput = document.createElement('input');
                minInput.type = 'number';
                minInput.className = 'form-control form-control-sm mb-1';
                minInput.placeholder = 'Min';
                minInput.value = currentFilters.priceMin || filter.min || '';
                minInput.min = filter.min || '';
                minInput.max = filter.max || '';
                const maxInput = document.createElement('input');
                maxInput.type = 'number';
                maxInput.className = 'form-control form-control-sm mb-1';
                maxInput.placeholder = 'Max';
                maxInput.value = currentFilters.priceMax || filter.max || '';
                maxInput.min = filter.min || '';
                maxInput.max = filter.max || '';
                // Uygula butonu
                const applyBtn = document.createElement('button');
                applyBtn.type = 'button';
                applyBtn.className = 'btn btn-primary btn-sm w-100';
                applyBtn.textContent = 'Uygula';
                applyBtn.style.marginTop = '4px';
                applyBtn.onclick = function() {
                    currentFilters.priceMin = minInput.value;
                    currentFilters.priceMax = maxInput.value;
                    currentPage = 1;
                    loadTable();
                };
                group.appendChild(minInput);
                group.appendChild(maxInput);
                group.appendChild(applyBtn);
            } else {
                // Çoklu seçimli checkbox, kaydırılabilir kutu
                const scrollDiv = document.createElement('div');
                scrollDiv.style.maxHeight = '160px';
                scrollDiv.style.overflowY = 'auto';
                filter.options.forEach(opt => {
                    const checkDiv = document.createElement('div');
                    checkDiv.className = 'form-check';
                    const check = document.createElement('input');
                    check.type = 'checkbox';
                    check.className = 'form-check-input';
                    check.id = key + '_' + opt;
                    check.value = opt;
                    check.checked = (currentFilters[key]||[]).includes(opt);
                    check.onchange = function() {
                        let arr = currentFilters[key] || [];
                        if(this.checked) arr = [...arr, opt];
                        else arr = arr.filter(x => x !== opt);
                        currentFilters[key] = arr;
                        currentPage = 1;
                        loadTable();
                    };
                    const label = document.createElement('label');
                    label.className = 'form-check-label';
                    label.setAttribute('for', check.id);
                    label.textContent = opt;
                    checkDiv.appendChild(check);
                    checkDiv.appendChild(label);
                    scrollDiv.appendChild(checkDiv);
                });
                group.appendChild(scrollDiv);
            }
            sidebar.appendChild(group);
        });
    }
    function renderPagination(total, page, pageSize) {
        const pageCount = Math.ceil(total / pageSize);
        if (pageCount <= 1) {
            paginationControls.innerHTML = '';
            paginationInfo.textContent = '';
            return;
        }
        let html = '';
        // Önceki
        html += `<li class="page-item${page === 1 ? ' disabled' : ''}"><a class="page-link" href="#" data-page="${page-1}">&laquo;</a></li>`;
        // Sayfa numaraları (maksimum 5 göster)
        let start = Math.max(1, page - 2);
        let end = Math.min(pageCount, page + 2);
        if (page <= 3) { end = Math.min(5, pageCount); }
        if (page >= pageCount - 2) { start = Math.max(1, pageCount - 4); }
        for (let i = start; i <= end; i++) {
            html += `<li class="page-item${i === page ? ' active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        // Sonraki
        html += `<li class="page-item${page === pageCount ? ' disabled' : ''}"><a class="page-link" href="#" data-page="${page+1}">&raquo;</a></li>`;
        paginationControls.innerHTML = html;
        paginationInfo.textContent = `${total} kayıttan ${(page-1)*pageSize+1} - ${Math.min(page*pageSize,total)} arası gösteriliyor`;
        // Event
        paginationControls.querySelectorAll('a.page-link').forEach(a => {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                const p = parseInt(this.getAttribute('data-page'));
                if (!isNaN(p) && p >= 1 && p <= pageCount && p !== page) {
                    currentPage = p;
                    loadTable();
                }
            });
        });
    }
    function filterData(data) {
        let filtered = data;
        Object.entries(currentFilters).forEach(([key, val]) => {
            if (val && val !== '') filtered = filtered.filter(row => row[key] == val);
        });
        return filtered;
    }
    function buildQueryString(filters, page, pageSize) {
        const params = [];
        for (const key in filters) {
            if (Array.isArray(filters[key])) {
                filters[key].forEach(val => {
                    if (val !== '') params.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
                });
            } else if (filters[key] !== undefined && filters[key] !== '') {
                params.push(`${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`);
            }
        }
        params.push(`page=${page}`);
        params.push(`pageSize=${pageSize}`);
        return params.length ? '?' + params.join('&') : '';
    }
    // --- Main Table Loader ---
    async function loadTable() {
        showLoading();
        try {
            const query = buildQueryString(currentFilters, currentPage, pageSize);
            const res = await fetch(queryApiMap[currentCategory] + query);
            const { data, total } = await res.json();
            renderTable(data);
            renderPagination(total, currentPage, pageSize);
            await renderSidebarFilters();
        } catch {
            tbody.innerHTML = `<tr><td colspan="${categoryConfig[currentCategory].columns.length}" class="text-center">Veri yüklenemedi.</td></tr>`;
        }
    }
    async function loadFilters() {
        filterRow.innerHTML = '';
        const res = await fetch(filterApiMap[currentCategory]);
        const filterData = await res.json();
        const filters = categoryConfig[currentCategory].filters;
        if (!filters || filters.length === 0) return;
        filters.forEach(f => {
            const col = document.createElement('div');
            col.className = 'col-auto mb-2';
            if (f.type === 'select') {
                const select = document.createElement('select');
                select.className = 'form-select form-select-sm select2';
                select.multiple = true;
                select.setAttribute('data-filter', f.key);
                let options = filterData[f.key + 's'] || filterData[f.key + 'es'] || filterData[f.key] || [];
                options = Array.from(new Set(['', ...options]));
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt === '' ? 'Tümü' : opt;
                    select.appendChild(option);
                });
                if (Array.isArray(currentFilters[f.key])) {
                    Array.from(select.options).forEach(o => {
                        if (currentFilters[f.key].includes(o.value)) o.selected = true;
                    });
                }
                select.addEventListener('change', function() {
                    currentFilters[f.key] = Array.from(this.selectedOptions).map(o => o.value).filter(v => v !== '');
                    currentPage = 1;
                    loadTable();
                });
                const label = document.createElement('label');
                label.className = 'form-label me-2 mb-0';
                label.textContent = f.label + ':';
                col.appendChild(label);
                col.appendChild(select);
            }
            filterRow.appendChild(col);
        });
        setTimeout(loadSelect2, 0);
        await renderSidebarFilters(); // Sidebar filtreleri yükle
    }
    // --- Category Button Handler ---
    categoryButtons.addEventListener('click', async function(e) {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            currentPage = 1;
            currentFilters = {};
            await renderSidebarFilters();
            loadTable();
        }
    });

    // --- Initial Load ---
    loadFilters();
    loadTable();
})(); 