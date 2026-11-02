(function(){
var kw=/\b(static|int|char|void|struct|typedef|return|if|else|while|for|do|switch|case|break|const|long|size_t|sizeof|default|continue|define)\b/;
var re=new RegExp('(\\/\\*[\\s\\S]*?\\*\\/)|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])+\')|(^#\\w+.*$)|('+kw.source+')|(\\b\\d+\\b)','gm');
document.querySelectorAll('pre.code code').forEach(function(el){
 el.innerHTML=el.innerHTML.replace(re,function(m,c,s,p,k,k2,n){return c?'<span class="c">'+c+'</span>':s?'<span class="s">'+s+'</span>':p?'<span class="pp">'+p+'</span>':k?'<span class="k">'+k+'</span>':'<span class="n">'+m+'</span>'});
});
document.querySelectorAll('.cp').forEach(function(b){b.onclick=function(){
 var t=b.parentNode.querySelector('code').innerText;
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Copied'},function(){b.textContent='Press Ctrl+C'});
 setTimeout(function(){b.textContent='Copy'},1600)}});
})();
