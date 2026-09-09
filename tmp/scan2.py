import struct, json
def read_bmp(p):
    d=open(p,'rb').read()
    off=struct.unpack('<I', d[10:14])[0]
    w=struct.unpack('<i', d[18:22])[0]; h=struct.unpack('<i', d[22:26])[0]
    topdown = h<0; h=abs(h)
    rowsz=((w*24+31)//32)*4
    px=[[None]*w for _ in range(h)]
    for y in range(h):
        ry = y if topdown else h-1-y
        row=d[off+y*rowsz: off+y*rowsz+rowsz]
        for x in range(w):
            b,g,r = row[x*3], row[x*3+1], row[x*3+2]
            px[ry][x]=(r,g,b)
    return w,h,px
W,H,PX=read_bmp('tmp/ref.bmp')
def hx(t): return '#%02x%02x%02x'%t[:3]
# amber hunt in top-left panel region
from collections import Counter
c=Counter(); pts=[]
for y in range(100,360,2):
    for x in range(5,420,2):
        r,g,b=PX[y][x]
        if r>150 and 90<g<200 and b<80:
            c[hx((r,g,b))]+=1; pts.append((x,y))
print('amberHits top-left:', c.most_common(6))
if pts:
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    print('amberBBox x %d-%d y %d-%d n=%d'%(min(xs),max(xs),min(ys),max(ys),len(pts)))
# amber in whole timeline strip
c2=Counter(); pts2=[]
for y in range(820,900):
    for x in range(0,1600,2):
        r,g,b=PX[y][x]
        if r>170 and 110<g<200 and b<90:
            c2[hx((r,g,b))]+=1; pts2.append((x,y))
print('amberHits timeline:', c2.most_common(4), 'bbox', (min(p[0] for p in pts2), max(p[0] for p in pts2), min(p[1] for p in pts2), max(p[1] for p in pts2)) if pts2 else None)
# timeline vertical rules: scan row y=865 for lighter columns between x=200..1200
row=[]
for x in range(150,1250,1):
    r,g,b=PX[866][x]
    row.append((x,(r,g,b)))
# find columns brighter than neighborhood (rules)
import statistics
lum=[0.2126*r+0.7152*g+0.0722*b for _,(r,g,b) in row]
rules=[x for i,(x,l) in enumerate(zip([x for x,_ in row],lum)) if 60<i<1090 and l>lum[i-3]+18 and l>lum[i+3]+18]
print('ruleCols y=866:', rules[:40])
# blue-red top strip / red logo circle bbox
pts3=[(x,y) for y in range(20,110) for x in range(600,1000,2) if PX[y][x][0]>150 and PX[y][x][1]<70 and PX[y][x][2]<70]
print('redLogoBBox:', (min(p[0] for p in pts3), min(p[1] for p in pts3), max(p[0] for p in pts3), max(p[1] for p in pts3)) if pts3 else None)
# notification card dark surface: interior near (30,220)-(200,260)
from statistics import mean
def avg(x1,y1,x2,y2):
    rs=gs=bs=n=0
    for y in range(y1,y2):
        for x in range(x1,x2):
            r,g,b=PX[y][x]; rs+=r; gs+=g; bs+=b; n+=1
    return hx((rs//n,gs//n,bs//n))
print('notifCard:', avg(20,215,210,255))
print('searchField:', avg(120,60,420,95))
print('fcPanelMid:', avg(40,170,300,240))
print('modelSelActive:', avg(1280,838,1360,858))
print('modelSelInactive:', avg(1420,838,1560,858))
print('windParticleSample avg over sea (900,380)-(1100,480):', avg(900,380,1100,480))
