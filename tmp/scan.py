import struct, colorsys, json
def read_bmp(p):
    d=open(p,'rb').read()
    off=struct.unpack('<I', d[10:14])[0]
    w=struct.unpack('<i', d[18:22])[0]; h=struct.unpack('<i', d[22:26])[0]
    bpp=struct.unpack('<H', d[28:30])[0]; topdown = h<0; h=abs(h)
    rowsz=((w*bpp+31)//32)*4
    px=[[None]*w for _ in range(h)]
    for y in range(h):
        ry = y if topdown else h-1-y
        row=d[off+y*rowsz: off+y*rowsz+rowsz]
        for x in range(w):
            b,g,r = row[x*3], row[x*3+1], row[x*3+2]
            px[ry][x]=(r,g,b)
    return w,h,px
W,H,PX=read_bmp('tmp/ref.bmp')
def region_avg(x1,y1,x2,y2,pred=None):
    rs=gs=bs=n=0
    for y in range(y1,y2):
        for x in range(x1,x2):
            r,g,b=PX[y][x]
            if pred and not pred(r,g,b): continue
            rs+=r; gs+=g; bs+=b; n+=1
    return (rs//n, gs//n, bs//n, n) if n else None
def hx(t): return '#%02x%02x%02x'%t[:3]
sat=lambda r,g,b: max(r,g,b)-min(r,g,b)
# 1) chrome pixels: low saturation, in known panel boxes
boxes={'forecastPanel':(20,140,330,300),'layerRail':(1290,160,1440,560),'bottomBar':(160,840,1250,890),'ctrlCluster':(1300,590,1600,700),'timeBadgeArea':(0,836,88,861)}
for name,(x1,y1,x2,y2) in boxes.items():
    a=region_avg(x1,y1,x2,y2,pred=lambda r,g,b: sat(r,g,b)<25)
    print('chrome',name,hx(a) if a else None, a[3] if a else 0)
# 2) legend gradient stops: legend box (1271,868)-(1592,890)
ly1,ly2=872,886
stops=[]
for x in range(1275,1590,5):
    rs=gs=bs=n=0
    for y in range(ly1,ly2):
        r,g,b=PX[y][x]
        rs+=r;gs+=g;bs+=b;n+=1
    stops.append((x,hx((rs//n,gs//n,bs//n))))
print('legendStops:', json.dumps(stops))
# 3) border scan: forecast panel left edge — find x run of dark border near x=0..10 at y=220
for y in (150,220,280):
    row=[(x,hx(PX[y][x])) for x in range(0,14)]
    print('rowScan y=%d:'%y, row)
# top edge of forecast panel: scan y at x=150
col=[(y,hx(PX[y][150])) for y in range(130,155)]
print('colScan x=150:', col)
# layer rail pill left edge: scan x at y=200 (rail 1290..1440)
row=[(x,hx(PX[200][x])) for x in range(1285,1305)]
print('railRow y=200 x1285-1305:', row)
# bottom timeline top edge: scan y at x=600
col=[(y,hx(PX[y][600])) for y in range(830,850)]
print('timelineTop x=600:', col)
# corner radius: red button top-left corner — bbox (1548,55,41,43)
y0,x0=55,1548
for dy in range(0,12):
    row=''.join('R' if sat(*PX[y0+dy][x])>60 and PX[y0+dy][x][0]>120 else '.' for x in range(x0,x0+12))
    print('redBtn r%d:'%dy,row)
# 4) amber band under forecast panel (visual intensity strip): scan y 300..320 x 30..300
for y in range(298,320,3):
    a=region_avg(30,y,300,y+1)
    print('amberBand y=%d'%y, hx(a) if a else None)
