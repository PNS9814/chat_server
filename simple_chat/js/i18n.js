// Simple client-side i18n loader
const i18n = (function(){
    const cache = {};
    let current = 'ja';
    let map = {};

    async function load(lang){
        if (!lang) lang = 'ja';
        if (cache[lang]){
            map = cache[lang];
            current = lang;
            return Promise.resolve();
        }
        const path = `/simple_chat/lang/${lang}.json`;
        try{
            const res = await fetch(path);
            if (!res.ok) throw new Error('not found');
            const json = await res.json();
            cache[lang] = json;
            map = json;
            current = lang;
        }catch(err){
            console.warn('i18n load failed for', lang, err);
            // fallback to en if available
            if (lang !== 'en') return load('en');
        }
    }

    function t(key, vars){
        vars = vars || {};
        const parts = key.split('.');
        let v = map;
        for (let p of parts){
            if (v && typeof v === 'object' && p in v) v = v[p];
            else { v = null; break; }
        }
        let out = v || key;
        // simple interpolation
        Object.keys(vars).forEach(k=>{
            out = out.replace(new RegExp(`\\{\\s*${k}\\s*\\}`,'g'), vars[k]);
        });
        return out;
    }

    return { load, t, _map: ()=>map };
})();

// expose helper t globally for convenience
function t(key, vars){
    if (typeof i18n !== 'undefined' && i18n.t) return i18n.t(key, vars);
    return key;
}
