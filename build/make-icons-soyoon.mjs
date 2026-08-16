import fs from 'fs';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('../icons/', import.meta.url)).replace(/[\\/]$/, '');

const CRC = (() => { const t = new Uint32Array(256);
  for (let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0; } return t; })();
function crc32(b){ let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=CRC[(c^b[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function chunk(type,data){ const t=Buffer.from(type,'ascii'); const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
  const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t,data])),0); return Buffer.concat([len,t,data,crc]); }
function encodePNG(w,h,rgba){ const sig=Buffer.from([137,80,78,71,13,10,26,10]); const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4); ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  const raw=Buffer.alloc((w*4+1)*h);
  for(let y=0;y<h;y++){ raw[y*(w*4+1)]=0; for(let x=0;x<w*4;x++) raw[y*(w*4+1)+1+x]=rgba[y*w*4+x]; }
  const idat=zlib.deflateSync(raw,{level:9});
  return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]); }

function lerp(a,b,t){ return a+(b-a)*t; }
function mix(c1,c2,t){ return [Math.round(lerp(c1[0],c2[0],t)),Math.round(lerp(c1[1],c2[1],t)),Math.round(lerp(c1[2],c2[2],t))]; }
const RED_TOP=[240,72,64], RED_BOT=[190,44,36], WHITE=[248,249,251];

function inRoundRect(x,y,size,r){ const min=r,max=size-r;
  if(x>=min&&x<=max) return y>=0&&y<=size; if(y>=min&&y<=max) return x>=0&&x<=size;
  const cx=x<min?min:max, cy=y<min?min:max; return (x-cx)*(x-cx)+(y-cy)*(y-cy)<=r*r; }
function sq(cx,cy,half,ang){ const a=ang*Math.PI/180,c=Math.cos(a),s=Math.sin(a),p=[];
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{ const x=sx*half,y=sy*half; p.push([cx+x*c-y*s, cy+x*s+y*c]); }); return p; }
function inPoly(x,y,pts){ let inside=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){ const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
  const hit=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi); if(hit) inside=!inside; } return inside; }

function render(size, {rounded=true, fullBleed=false, scale=0.62}={}){
  const rgba=Buffer.alloc(size*size*4); const r=size*0.22; const cx=size/2, cy=size/2;
  const outer=sq(cx,cy,size*scale/2, 14), inner=sq(cx,cy,size*scale/2*0.46, 14);
  const SS=3;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    let ar=0,ag=0,ab=0,aa=0;
    for(let sy=0;sy<SS;sy++) for(let sx=0;sx<SS;sx++){
      const px=x+(sx+0.5)/SS, py=y+(sy+0.5)/SS; let col=null,al=0;
      const bgIn = fullBleed ? true : (rounded ? inRoundRect(px,py,size,r) : true);
      if(bgIn){ col=mix(RED_TOP,RED_BOT, py/size); al=255;
        if(inPoly(px,py,outer) && !inPoly(px,py,inner)){ col=WHITE; al=255; } }
      ar+=col?col[0]*al:0; ag+=col?col[1]*al:0; ab+=col?col[2]*al:0; aa+=al;
    }
    const i=(y*size+x)*4, A=aa/(SS*SS);
    if(A>0){ rgba[i]=Math.round(ar/aa); rgba[i+1]=Math.round(ag/aa); rgba[i+2]=Math.round(ab/aa); rgba[i+3]=Math.round(A); }
  }
  return encodePNG(size,size,rgba);
}

fs.writeFileSync(DIR+'/icon-192.png', render(192,{rounded:true}));
fs.writeFileSync(DIR+'/icon-512.png', render(512,{rounded:true}));
fs.writeFileSync(DIR+'/icon-512-maskable.png', render(512,{fullBleed:true, scale:0.5}));
fs.writeFileSync(DIR+'/apple-touch-icon-180.png', render(180,{fullBleed:true, scale:0.6}));
fs.writeFileSync(DIR+'/icon-32.png', render(32,{rounded:true, scale:0.7}));
console.log('soyoon icons written');
