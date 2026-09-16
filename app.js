const $=s=>document.querySelector(s);
const imageExt=/\.(jpe?g|png|webp|gif|bmp|avif)$/i;
const FAV_KEY='photovault-favorites-v1',TRASH_KEY='photovault-trash-v1',META_KEY='photovault-meta-v1';
let photos=[],visible=[],objectUrls=[],detailPhoto=null;
let favorites=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
let trash=new Set(JSON.parse(localStorage.getItem(TRASH_KEY)||'[]'));
let metadata=JSON.parse(localStorage.getItem(META_KEY)||'{}');

function clean(){objectUrls.forEach(URL.revokeObjectURL);objectUrls=[]}
function saveSet(k,s){localStorage.setItem(k,JSON.stringify([...s]))}
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(metadata))}catch{}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';if(n<1073741824)return(n/1048576).toFixed(1)+' MB';return(n/1073741824).toFixed(2)+' GB'}
function photoTime(p){return p.takenAt||p.lastModified}
function monthKey(ts){const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function isMemory(p,now=new Date()){const d=new Date(photoTime(p));return d.getFullYear()<now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate()}

async function walk(dir,prefix=''){
  const out=[];
  for await(const [name,h] of dir.entries()){
    if(name.startsWith('.'))continue;
    if(h.kind==='directory')out.push(...await walk(h,prefix+name+'/'));
    else if(imageExt.test(name)){
      const f=await h.getFile(),path=prefix+name,cached=metadata[path]||{};
      out.push({name,path,size:f.size,lastModified:f.lastModified,folder:(prefix.split('/')[0]||'Root'),file:f,...cached});
    }
  }
  return out;
}

function readAscii(v,o,n){let s='';for(let i=0;i<n&&o+i<v.byteLength;i++){const c=v.getUint8(o+i);if(!c)break;s+=String.fromCharCode(c)}return s}
function parseExifDate(s){const m=/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(s||'');return m?new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`).getTime():null}
function parseExif(buf){
  try{
    const v=new DataView(buf);if(v.getUint16(0)!==0xffd8)return{};
    let off=2;
    while(off+4<v.byteLength){
      if(v.getUint8(off)!==0xff){off++;continue}
      const marker=v.getUint8(off+1),len=v.getUint16(off+2);
      if(marker===0xe1&&readAscii(v,off+4,6)==='Exif'){
        const t=off+10,little=v.getUint16(t)===0x4949,get16=p=>v.getUint16(p,little),get32=p=>v.getUint32(p,little);
        if(get16(t+2)!==42)return{};
        const ifd0=t+get32(t+4),result={};
        const valueOf=(type,count,valOff,entry)=>{
          const size={1:1,2:1,3:2,4:4,5:8}[type]||1,total=size*count,pos=total<=4?entry+8:t+valOff;
          if(type===2)return readAscii(v,pos,count);
          if(type===3&&count===1)return get16(pos);
          if(type===4&&count===1)return get32(pos);
          if(type===5){const arr=[];for(let i=0;i<count;i++)arr.push(get32(pos+i*8)/Math.max(1,get32(pos+i*8+4)));return arr}
          return null;
        };
        const readIfd=(pos)=>{
          const tags={};const n=get16(pos);
          for(let i=0;i<n;i++){const e=pos+2+i*12;if(e+12>v.byteLength)break;const tag=get16(e),type=get16(e+2),count=get32(e+4),val=get32(e+8);tags[tag]=valueOf(type,count,val,e)}
          return tags;
        };
        const base=readIfd(ifd0),exifPtr=base[0x8769],gpsPtr=base[0x8825];
        if(exifPtr){const ex=readIfd(t+exifPtr);const raw=ex[0x9003]||ex[0x9004];const ts=parseExifDate(raw);if(ts)result.takenAt=ts}
        if(gpsPtr){
          const g=readIfd(t+gpsPtr),lat=g[2],lon=g[4],latRef=g[1],lonRef=g[3];
          if(Array.isArray(lat)&&Array.isArray(lon)){let la=lat[0]+lat[1]/60+lat[2]/3600,lo=lon[0]+lon[1]/60+lon[2]/3600;if(latRef==='S')la=-la;if(lonRef==='W')lo=-lo;result.gps={lat:+la.toFixed(6),lon:+lo.toFixed(6)}}
        }
        return result;
      }
      if(marker===0xda||len<2)break;off+=2+len;
    }
  }catch{}
  return{};
}

async function scanMetadata(list,onProgress=()=>{}){
  let done=0;
  for(let i=0;i<list.length;i+=4){
    await Promise.all(list.slice(i,i+4).map(async p=>{
      if(/\.jpe?g$/i.test(p.name)&&(!p.takenAt&&!p.gps)){
        const buf=await p.file.slice(0,512*1024).arrayBuffer(),ex=parseExif(buf);
        Object.assign(p,ex);metadata[p.path]={takenAt:p.takenAt||null,gps:p.gps||null};
      }
      done++;onProgress(done,list.length);
    }));
  }
  saveMeta();
}

function refreshAlbums(){
  const current=$('#album').value,folders=[...new Set(photos.map(p=>p.folder))].sort();
  $('#album').innerHTML='<option value="">All folders</option>'+folders.map(x=>`<option>${esc(x)}</option>`).join('');
  if(folders.includes(current))$('#album').value=current;
}

function render(){
  clean();
  const q=$('#q').value.toLowerCase(),album=$('#album').value,sort=$('#sort').value,smart=$('#smart').value;
  visible=photos.filter(p=>{
    if(trash.has(p.path)&&smart!=='trash')return false;
    if(!trash.has(p.path)&&smart==='trash')return false;
    if(q&&!(`${p.path} ${p.gps?`${p.gps.lat} ${p.gps.lon}`:''}`).toLowerCase().includes(q))return false;
    if(album&&p.folder!==album)return false;
    if(smart==='favorites'&&!favorites.has(p.path))return false;
    if(smart==='memories'&&!isMemory(p))return false;
    if(smart==='gps'&&!p.gps)return false;
    return true;
  });
  visible.sort((a,b)=>sort==='oldest'?photoTime(a)-photoTime(b):sort==='name'?a.name.localeCompare(b.name):sort==='size'?b.size-a.size:photoTime(b)-photoTime(a));
  const groups=visible.reduce((a,p)=>((a[monthKey(photoTime(p))]??=[]).push(p),a),{});
  $('#main').innerHTML=Object.entries(groups).map(([m,arr])=>`<section class="month"><h2>${m} <small>(${arr.length})</small></h2><div class="grid">${arr.map(p=>{const u=URL.createObjectURL(p.file);objectUrls.push(u);const i=visible.indexOf(p);return `<div class="tile" data-index="${i}" title="${esc(p.path)}"><img loading="lazy" src="${u}"><span>${esc(p.name)}</span>${favorites.has(p.path)?'<i class="star">★</i>':''}${p.gps?'<i class="gps">⌖</i>':''}</div>`}).join('')}</div></section>`).join('')||'<p>No photos match the current filters.</p>';
  document.querySelectorAll('.tile').forEach(el=>el.onclick=()=>openDetails(visible[Number(el.dataset.index)]));
  const memories=photos.filter(p=>!trash.has(p.path)&&isMemory(p)).length;
  $('#status').textContent=`${visible.length} shown / ${photos.length} indexed • ${favorites.size} favorites • ${memories} memories today • ${trash.size} in local recycle bin.`;
}

function openDetails(p){
  if(!p)return;detailPhoto=p;
  const u=URL.createObjectURL(p.file);objectUrls.push(u);$('#detailImg').src=u;$('#detailTitle').textContent=p.name;
  $('#detailMeta').innerHTML=`<dt>Path</dt><dd>${esc(p.path)}</dd><dt>Folder</dt><dd>${esc(p.folder)}</dd><dt>Size</dt><dd>${formatBytes(p.size)}</dd><dt>Timeline date</dt><dd>${new Date(photoTime(p)).toLocaleString()}</dd><dt>Date source</dt><dd>${p.takenAt?'EXIF DateTimeOriginal':'File modified date'}</dd><dt>GPS</dt><dd>${p.gps?`${p.gps.lat}, ${p.gps.lon}`:'None detected'}</dd><dt>Favorite</dt><dd>${favorites.has(p.path)?'Yes':'No'}</dd><dt>Recycle bin</dt><dd>${trash.has(p.path)?'Hidden locally':'No'}</dd>`;
  $('#toggleFav').textContent=favorites.has(p.path)?'Remove favorite':'Add favorite';
  $('#toggleTrash').textContent=trash.has(p.path)?'Restore from local recycle bin':'Hide in local recycle bin';
  $('#details').showModal();
}

$('#toggleFav').onclick=()=>{if(!detailPhoto)return;favorites.has(detailPhoto.path)?favorites.delete(detailPhoto.path):favorites.add(detailPhoto.path);saveSet(FAV_KEY,favorites);$('#details').close();render()};
$('#toggleTrash').onclick=()=>{if(!detailPhoto)return;trash.has(detailPhoto.path)?trash.delete(detailPhoto.path):trash.add(detailPhoto.path);saveSet(TRASH_KEY,trash);$('#details').close();render()};
async function hashFile(f){return[...new Uint8Array(await crypto.subtle.digest('SHA-256',await f.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('')}

$('#open').onclick=async()=>{
  if(!window.showDirectoryPicker)return alert('Use Chrome or Edge on desktop.');
  const d=await showDirectoryPicker();$('#status').textContent='Scanning files…';photos=await walk(d);refreshAlbums();render();
  $('#status').textContent=`Reading local EXIF metadata for ${photos.length} files…`;
  await scanMetadata(photos,(n,total)=>{if(n%20===0||n===total)$('#status').textContent=`Reading EXIF metadata… ${n}/${total}`});
  render();
};
['q','album','sort','smart'].forEach(id=>$('#'+id).oninput=render);

$('#dupes').onclick=async()=>{
  if(!photos.length)return;$('#status').textContent='Hashing files with matching sizes…';
  const bySize={};for(const p of photos.filter(p=>!trash.has(p.path)))(bySize[p.size]??=[]).push(p);const groups=[];
  for(const arr of Object.values(bySize).filter(x=>x.length>1)){const hm={};for(const p of arr){const h=await hashFile(p.file);(hm[h]??=[]).push(p)}for(const g of Object.values(hm))if(g.length>1)groups.push(g)}
  const reclaim=groups.reduce((sum,g)=>sum+g[0].size*(g.length-1),0);
  $('#dupeList').innerHTML=groups.length?`<p><b>${groups.length} groups • up to ${formatBytes(reclaim)} reclaimable</b></p>`+groups.map(g=>`<div class="dupe"><b>${g.length} identical files • ${formatBytes(g[0].size)}</b><ul>${g.map(p=>`<li>${esc(p.path)}</li>`).join('')}</ul></div>`).join(''):'<p>No exact duplicates found.</p>';
  $('#dlg').showModal();$('#status').textContent=`${groups.length} duplicate groups.`;
};

$('#export').onclick=()=>{
  const data=photos.map(({path,size,lastModified,folder,takenAt,gps})=>({path,size,lastModified,folder,takenAt:takenAt||null,gps:gps||null,favorite:favorites.has(path),locallyHidden:trash.has(path)}));
  download('photovault-index.json',JSON.stringify({version:3,exportedAt:new Date().toISOString(),photos:data},null,2),'application/json');
};
function download(n,s,t){const u=URL.createObjectURL(new Blob([s],{type:t})),a=document.createElement('a');a.href=u;a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
