
(()=>{
const root=document.getElementById('weather-difference-chart'),plot=root.querySelector('#weather-bars');
const data=[['Jul 22, 2026',7.01],['Jul 24, 2026',6.41],['Jun 22, 2026',6.06],['Jun 12, 2026',5.76],['Jun 8, 2026',5.67],['Jun 23, 2026',5.59],['Jun 11, 2026',5.52],['Jun 18, 2026',5.42],['Sep 14, 2026',5.24],['Sep 11, 2026',5.18],['Jan 10, 2026',-4.91],['Jan 20, 2026',-5.34],['Jan 17, 2026',-6.63],['Jan 27, 2026',-6.8],['Jan 30, 2026',-7.84],['Mar 16, 2026',-8.57],['Jan 31, 2026',-9.99],['Jan 26, 2026',-10.48],['Jan 24, 2026',-12.34],['Jan 25, 2026',-16.13]];
function draw(){
const w=plot.clientWidth,h=640,left=108,right=12,top=12,bottom=48,max=Math.max(...data.map(d=>Math.abs(d[1])))*1.15;
const x=v=>left+(v+max)/(2*max)*(w-left-right),zero=x(0);
let s=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Top ten and bottom ten days by average feels-like difference. Orange bars to the right felt hotter. Blue bars to the left felt colder."><rect data-chart-frame x="${left}" y="${top}" width="${w-left-right}" height="${h-top-bottom}" fill="none" stroke="var(--border)"/><line x1="${zero}" x2="${zero}" y1="${top}" y2="${h-bottom}" stroke="var(--foreground)" stroke-width="1"/>`;
data.forEach(([date,v],i)=>{const y=top+15+i*28;s+=`<text x="${left-8}" y="${y+4}" text-anchor="end">${date}</text><rect x="${Math.min(zero,x(v))}" y="${y-4}" width="${Math.abs(x(v)-zero)}" height="8" fill="var(--${v>0?'orange':'blue'})" data-tooltip="${date}: ${v>0?'+':''}${v.toFixed(2)}°F"><title>${date}: ${v.toFixed(2)}°F</title></rect><text x="${v>0?x(v)+5:x(v)-5}" y="${y+4}" text-anchor="${v>0?'start':'end'}">${v>0?'+':''}${v.toFixed(2)}</text>`;});
[-max,0,max].forEach(v=>{s+=`<text x="${x(v)}" y="${h-bottom+20}" text-anchor="${v<0?'start':v>0?'end':'middle'}">${v===0?'0':(v>0?'+':'')+v.toFixed(0)}°F</text>`;});
s+=`<text class="axis-title" data-axis="x" x="${(left+w-right)/2}" y="${h-5}" text-anchor="middle">Degrees colder ← 0 → Degrees warmer (°F)</text><text class="axis-title" data-axis="y" x="6" y="${h-24}">Date</text></svg>`;plot.innerHTML=s;
}
new ResizeObserver(draw).observe(plot);draw();
})();


(()=>{
const root=document.getElementById('dfw-draft'),data=JSON.parse(document.getElementById('dfw-data').textContent);
const months=['January','February','March','April','May','June','July','August','September'];
const fmt=v=>(v>0?'+':'')+v.toFixed(2)+'°F';
function bars(id,rows,xlabel){
const el=root.querySelector('#'+id),w=el.clientWidth,left=100,right=45,top=12,step=32,h=rows.length*step+65;
const limit=Math.max(...rows.map(r=>Math.abs(r[1])),1)*1.25,scale=v=>left+(v+limit)/(2*limit)*(w-left-right),z=scale(0);
let html=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${xlabel}"><rect data-chart-frame x="${left}" y="${top}" width="${w-left-right}" height="${h-60}" fill="none" stroke="var(--border)"/><line x1="${z}" x2="${z}" y1="${top}" y2="${h-48}" stroke="var(--foreground)"/>`;
rows.forEach(([name,v,n],i)=>{let y=top+16+i*step;html+=`<text x="${left-8}" y="${y+4}" text-anchor="end">${name}</text><rect x="${Math.min(z,scale(v))}" y="${y-4}" height="8" width="${Math.abs(scale(v)-z)}" fill="var(--${v<0?'blue':'orange'})" data-tooltip="${name}: ${fmt(v)}${n?', '+n+' observations':''}"/><text x="${v>=0?scale(v)+5:scale(v)-5}" y="${y+4}" text-anchor="${v>=0?'start':'end'}">${v>0?'+':''}${v.toFixed(2)}</text>`;});
html+=`<text x="${z}" y="${h-30}" text-anchor="middle">0</text><text class="axis-title" data-axis="x" x="${(left+w-right)/2}" y="${h-8}" text-anchor="middle">Colder ← Difference (°F) → Hotter</text><text class="axis-title" data-axis="y" x="4" y="${h-30}">${id==='dew-chart'?'Dew point °F':'Month'}</text></svg>`;el.innerHTML=html;
}
const dew=root.querySelector('#dew-select');function showDew(){bars('dew-chart',data.bins[dew.value].map(b=>[b.bin,b.delta,b.n]),'Average feels-like difference by dew point');root.querySelector('#dew-detail').textContent=dew.value==='hot'?'At 80°F or above, higher dew points are associated with greater feels-like uplift.':'Across all temperatures, seasonal temperature changes also influence this pattern.';}dew.addEventListener('change',showDew);
const month=root.querySelector('#month-select'),rain=root.querySelector('#rain-select');months.forEach((m,i)=>{month.add(new Option(m,String(i+1)));rain.add(new Option(m,String(i+1)));});month.value='7';
function showMonth(){let m=data.monthly.find(m=>m.month===Number(month.value));root.querySelector('#month-detail').textContent=`${months[m.month-1]}: average temperature ${m.temp.toFixed(2)}°F · dew point ${m.dew.toFixed(2)}°F · feels-like ${m.feel.toFixed(2)}°F · difference ${fmt(m.delta)} · ${m.n} observations.`;}month.addEventListener('change',showMonth);
function showRain(){let days=data.daily.filter(d=>rain.value==='all'||Number(d.date.slice(5,7))===Number(rain.value));let mean=(a,k)=>a.reduce((s,d)=>s+d[k],0)/a.length;let groups=[days.filter(d=>!d.wet),days.filter(d=>d.wet)];root.querySelector('#rain-detail').innerHTML='<table class="table table-sm"><thead><tr><th>Day type</th><th>Days</th><th>Average dew point</th><th>Average feel − temp</th></tr></thead><tbody>'+groups.map((a,i)=>`<tr><td>${i?'Precipitation / trace':'Dry'}</td><td>${a.length}</td><td>${mean(a,'dew').toFixed(2)}°F</td><td>${fmt(mean(a,'delta'))}</td></tr>`).join('')+'</tbody></table>';}rain.addEventListener('change',showRain);
function redraw(){showDew();bars('monthly-chart',data.monthly.map(m=>[months[m.month-1].slice(0,3),m.delta,m.n]),'Monthly average feels-like difference');}new ResizeObserver(redraw).observe(root);redraw();showMonth();showRain();
})();


(()=>{
const root=document.getElementById('dfw-animation'),data=JSON.parse(document.getElementById('dfw-data').textContent).monthly;
const names=['January','February','March','April','May','June','July','August','September'];
const status=root.querySelector('#weather-animation-status'),context=root.querySelector('#weather-animation-context'),plot=root.querySelector('#weather-animation-plot');
let index=0,timer=null,playing=false;
const all=data.flatMap(d=>[d.temp,d.feel]),lo=Math.floor((Math.min(...all)-5)/10)*10,hi=Math.ceil((Math.max(...all)+5)/10)*10;
function frame(){
const w=plot.clientWidth,l=28,r=28,h=170,max=Math.max(...data.map(d=>Math.abs(d.delta)))*1.35;
const x=v=>l+(v+max)/(2*max)*(w-l-r),z=x(0);
plot.innerHTML=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Monthly feels-like difference"><rect data-chart-frame x="${l}" y="25" width="${w-l-r}" height="85" fill="none" stroke="var(--border)"/><line x1="${z}" x2="${z}" y1="25" y2="110" stroke="var(--foreground)"/><rect id="animated-gap" class="moving" y="50" height="36"/><text x="${l}" y="132" text-anchor="start">Felt colder ←</text><text x="${z}" y="132" text-anchor="middle">0</text><text x="${w-r}" y="132" text-anchor="end">→ Felt hotter</text><text class="axis-title" data-axis="x" x="${w/2}" y="160" text-anchor="middle">Difference from actual temperature (°F)</text><text class="axis-title" data-axis="y" x="${l}" y="18">Monthly average</text></svg>`;
update();
}
function update(){
const m=data[index],w=plot.clientWidth,max=Math.max(...data.map(d=>Math.abs(d.delta)))*1.35,x=v=>28+(v+max)/(2*max)*(w-56),z=x(0),f=x(m.delta);
const gap=plot.querySelector('#animated-gap');gap.setAttribute('x',Math.min(z,f));gap.setAttribute('width',Math.abs(f-z));gap.setAttribute('fill',m.delta<0?'var(--blue)':'var(--orange)');
const callout=root.querySelector('#weather-gap-value');callout.textContent=Math.abs(m.delta).toFixed(2)+'°F '+(m.delta<0?'COLDER':'HOTTER');callout.style.color=m.delta<0?'var(--blue)':'var(--orange)';
root.querySelector('#weather-gap-direction').textContent=names[index]+' 2026 · Average feels-like difference';
status.textContent=`${names[index]} 2026 · ${index+1} of 9 · ${playing?'Playing':index===8?'Finished':'Paused'}`;
context.innerHTML=`<strong>Actual: ${m.temp.toFixed(2)}°F</strong> · <strong>Feels like: ${m.feel.toFixed(2)}°F</strong><br>It felt <strong>${Math.abs(m.delta).toFixed(2)}°F ${m.delta<0?'colder':'hotter'}</strong> on average. Dew point: <strong>${m.dew.toFixed(2)}°F</strong> (higher means more moisture in the air).`;
plot.querySelector('svg').setAttribute('aria-label',`${names[index]}: actual ${m.temp.toFixed(2)} degrees Fahrenheit, feels like ${m.feel.toFixed(2)}, dew point ${m.dew.toFixed(2)}`);
root.querySelector('#weather-play').disabled=playing;root.querySelector('#weather-pause').disabled=!playing;
}
function pause(){if(timer!==null)clearInterval(timer);timer=null;playing=false;update();}
root.querySelector('#weather-play').addEventListener('click',()=>{if(playing)return;if(index===8)index=0;playing=true;update();timer=setInterval(()=>{if(index<8){index++;update();}if(index===8)pause();},2400);});
root.querySelector('#weather-pause').addEventListener('click',pause);
root.querySelector('#weather-restart').addEventListener('click',()=>{pause();index=0;update();});
new ResizeObserver(frame).observe(plot);frame();
})();

// Native browser tooltips replace the conversation tooltip service.
const applyTooltips=()=>document.querySelectorAll('[data-tooltip]').forEach(el=>{if(el.getAttribute('aria-label')!==el.getAttribute('data-tooltip'))el.setAttribute('aria-label',el.getAttribute('data-tooltip'));if(el instanceof SVGElement&&!el.querySelector('title')){const t=document.createElementNS('http://www.w3.org/2000/svg','title');t.textContent=el.getAttribute('data-tooltip');el.appendChild(t);}else if(!(el instanceof SVGElement)){el.title=el.getAttribute('data-tooltip');}});
new MutationObserver(applyTooltips).observe(document.body,{childList:true,subtree:true});applyTooltips();
