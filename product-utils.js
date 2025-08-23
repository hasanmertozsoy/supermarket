function extractPieceCount(product) {
    if (!product || !product.name) return 1;
    
    if (product.pieceCount && !isNaN(parseInt(product.pieceCount))) {
        return parseInt(product.pieceCount);
    }
    if (product.adet && !isNaN(parseInt(product.adet))) {
        return parseInt(product.adet);
    }
    if (product.count && !isNaN(parseInt(product.count))) {
        return parseInt(product.count);
    }
    if (product.pieces && !isNaN(parseInt(product.pieces))) {
        return parseInt(product.pieces);
    }
    if (product.itemCount && !isNaN(parseInt(product.itemCount))) {
        return parseInt(product.itemCount);
    }
    
    if (product.specs && Array.isArray(product.specs)) {
        for (const specGroup of product.specs) {
            if (specGroup.items && Array.isArray(specGroup.items)) {
                for (const item of specGroup.items) {
                    if (item.name && typeof item.name === 'string' && 
                        (item.name.toLowerCase().includes('adet') || 
                         item.name.toLowerCase().includes('paket') ||
                         item.name.toLowerCase().includes('miktar'))) {
                        
                        if (item.value && typeof item.value === 'string') {
                            const numMatch = item.value.match(/(\d+)/);
                            if (numMatch && numMatch[1]) {
                                const count = parseInt(numMatch[1]);
                                if (count > 0) return count;
                            }
                        }
                    }
                }
            }
        }
    }
    
    const patterns = [
        /(\d+)\s*('lı|'li|li|lı|lü|lu|adet|ad\.|ad)/i,
        /(\d+)\s*paket/i,
        /(\d+)\s*x\s*\d+/i,
        /paket\s*:?\s*(\d+)/i,
        /(\d+)\s*adet\s*[\(\)×x\*]/i,
        /adet\s*:?\s*(\d+)(?:\s*adet)?/i,
        /içerik\s*:?\s*(\d+)/i,
        /(?:içinde|içeriğinde)\s*(\d+)/i,
        /(\d+)\s*(?:li|lı|lü|lu)\s*paket/i,
        /(\d+)\s*(?:adet|ad\.?|tane)\s*(?:içerir|bulunur|var|içeren)/i
    ];
    
    const specialDescriptionPatterns = [
        /içeriğinde\s*(?:toplam)?\s*(\d+)/i,
        /(\d+)\s*(?:adet|tane).*?(?:içerir|bulunur|barındırır)/i,
        /(\d+)'li\s*(?:ekonomik|avantaj|kampanya)/i,
        /(\d+)\s*(?:adet|tane)\s*(?:bir|tek)\s*pakette/i
    ];
    
    if (product.description && typeof product.description === 'string') {
        for (const pattern of specialDescriptionPatterns) {
            const match = product.description.match(pattern);
            if (match && match[1]) {
                const count = parseInt(match[1]);
                if (count > 0) return count;
            }
        }
    }
    
    const fieldsToCheck = [
        product.name,
        product.description,
        product.details,
        product.specs,
        product.attributes
    ];
    
    for (const field of fieldsToCheck) {
        if (!field) continue;
        
        const textToSearch = typeof field === 'string' 
            ? field 
            : JSON.stringify(field);
        
        for (const pattern of patterns) {
            const match = textToSearch.match(pattern);
            if (match && match[1]) {
                const count = parseInt(match[1]);
                return count > 0 ? count : 1;
            }
        }
    }
    
    return 1;
}

function calculateUnitPrice(product) {
    let unitPrice = typeof product.unit_price === 'number' ? product.unit_price : 0;
    
    if (product.price && product.quantity && product.quantity > 0) {
        const price = parseFloat(product.price);
        let quantity = parseFloat(product.quantity);
        let unit = product.unit || '';
        
        const pieceCount = extractPieceCount(product);
        
        quantity = quantity * pieceCount;
        
        if (unit === 'gr' && quantity >= 1) {
            quantity = quantity / 1000;
        } else if (unit === 'ml' && quantity >= 1) {
            quantity = quantity / 1000;
        }
        
        return price / quantity;
    }
    
    return unitPrice;
}

function formatUnitPrice(product) {
    const unitPrice = calculateUnitPrice(product);
    
    if (unitPrice <= 0) {
        return 'N/A';
    }
    
    const pieceCount = extractPieceCount(product);
    const hasPieceInfo = pieceCount > 1;
    
    let unit = product.unit || 'birim';
    if (unit === 'gr' && parseFloat(product.quantity) >= 1) {
        unit = 'kg';
    } else if (unit === 'ml' && parseFloat(product.quantity) >= 1) {
        unit = 'lt';
    }
    
    if (hasPieceInfo) {
        return `${unitPrice.toFixed(2)} TL/${unit} (${pieceCount} adet)`;
    }
    
    return `${unitPrice.toFixed(2)} TL/${unit}`;
}

function createProductUrl(product) {
    if (!product) return null;
    
    if (product.url && typeof product.url === 'string') {
        if (product.url.startsWith('/product.php?path=')) {
            const pathParam = product.url.split('?path=')[1];
            if (pathParam) {
                const decodedPath = pathParam.replace(/%2F/g, '/').replace(/%2C/g, ',');
                return `https://www.cimri.com/market/${decodedPath}`;
            }
        } else if (product.url.indexOf('?path=') > -1) {
            const cimriPath = product.url.substring(product.url.indexOf('?path=') + '?path='.length);
            const decodedPath = cimriPath.replace(/%2F/g, '/').replace(/%2C/g, ',');
            return `https://www.cimri.com/market/${decodedPath}`;
        } else if (product.url.startsWith('http://') || product.url.startsWith('https://')) {
            return product.url;
        }
    }
    
    if (product.id && typeof product.id === 'string') {
        if (product.id.includes('/') && product.id.includes(',')) {
            return `https://www.cimri.com/market/${product.id}`;
        }
        
        if (/^\d+$/.test(product.id) && product.name) {
            const slugName = product.name
                .toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
                
            const category = product.category || 'market';
            return `https://www.cimri.com/market/${category}/en-ucuz-${slugName},${product.id}`;
        }
        
        return `https://www.cimri.com/market/${product.id}`;
    }
    
    if (product.offers && product.offers.length > 0) {
        const firstOffer = product.offers[0];
        const merchantId = firstOffer.merchant_id;
        const price = firstOffer.price;

        let pseudoOfferId = '123456789'; 
        if (product.id && typeof product.id === 'string') {
            const parts = product.id.split(',');
            if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                pseudoOfferId = parts[1];
            } else if (!isNaN(parseInt(product.id))) {
                pseudoOfferId = product.id;
            }
        }

        const baseUrl = 'https://www.cimri.com/market/offer/';
        const depotId = '0';
        const platformName = 'CIMRI_DESKTOP';
        const pageType = 'PRODUCT';
        const offerOrder = '1';
        const priceOrder = '1';
        const offerCount = '1';
        const ctaTopOther = 'top';
        const productOrder = '0';

        const params = new URLSearchParams();
        params.append('platformName', platformName);
        params.append('pageType', pageType);
        params.append('minPrice', price ? price.toFixed(2) : '0.00');
        params.append('minPriceMerchant', merchantId);
        params.append('offerOrder', offerOrder);
        params.append('priceOrder', priceOrder);
        params.append('offerCount', offerCount);
        params.append('ctaTopOther', ctaTopOther);
        params.append('productOrder', productOrder);

        return `${baseUrl}${pseudoOfferId}/depot/${depotId}?${params.toString()}`;
    }
    
    return null;
}

function getAbsoluteUrl(url, baseUrl = 'http://localhost:8000') {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${baseUrl}${url}`;
}

function formatQuantityDisplay(product) {
    if (!product) return 'N/A';
    
    const pieceCount = extractPieceCount(product);
    const hasPieceInfo = pieceCount > 1;
    
    if (product.quantity) {
        let quantityDisplay = `${product.quantity} ${product.unit || ''}`;
        
        if (hasPieceInfo) {
            quantityDisplay += ` (${pieceCount} adet)`;
        }
        
        return quantityDisplay;
    }
    
    return 'N/A';
} 