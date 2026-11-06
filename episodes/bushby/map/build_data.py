import json, sys
sys.path.insert(0,'.')
from waypoints import W, W2, TURK, DC, T
SEGNAME={"A":"A 智利—阿根廷","B":"B 秘鲁—厄瓜多尔","C":"C 哥伦比亚—达连","D":"D 中美洲—墨西哥","E":"E 美国","F":"F 加拿大—阿拉斯加","BS":"白令海峡","G":"G 楚科奇—科雷马","H2":"H2 雅库特—阿穆尔","I":"I 蒙古—新疆—中亚","K":"布哈拉—里海","J":"J 高加索—土耳其—欧洲","UK":"英吉利海峡与归乡"}
pts=[]
for i,(n,la,lo,d,s,seg,m) in enumerate(W+W2):
    pts.append(dict(n=n,lat=la,lon=lo,d=d,s=s,seg=seg,m=m))
feats=[]
for i,p in enumerate(pts):
    feats.append({"type":"Feature","geometry":{"type":"Point","coordinates":[p['lon'],p['lat']]},
      "properties":{"order":i,"name":p['n'],"date":p['d'],"status":{"v":"verified","b":"book","i":"inferred"}[p['s']],"segment":SEGNAME[p['seg']],"leg_into":p['m']}})
    if i>0 and p['m']!='start':
        q=pts[i-1]
        feats.append({"type":"Feature","geometry":{"type":"LineString","coordinates":[[q['lon'],q['lat']],[p['lon'],p['lat']]]},
          "properties":{"kind":{"walk":"walk","swim":"swim","gap":"unknown_route"}[p['m']],"to":p['n'],"date":p['d'],"inferred":p['s']=='i' or q['s']=='i',"segment":SEGNAME[p['seg']]}})
feats.append({"type":"Feature","geometry":{"type":"LineString","coordinates":[[x[2],x[1]] for x in TURK]},"properties":{"kind":"voided","note":"2019 土库曼斯坦段：被逐出境后作废，2023 年从布哈拉重走"}})
feats.append({"type":"Feature","geometry":{"type":"LineString","coordinates":[[x[2],x[1]] for x in DC]},"properties":{"kind":"protest_walk","note":"2013-09-03 至 2014-09-10 洛杉矶→华盛顿俄使馆抗议步行，不计入环球路线"}})
for lab,k,cs,note,case in T:
    feats.append({"type":"Feature","geometry":{"type":"LineString","coordinates":[[c[1],c[0]] for c in cs]},"properties":{"kind":"transport","transport_type":k,"label":lab,"note":note,"case":case}})
gj={"type":"FeatureCollection","name":"Karl Bushby Goliath Expedition route (schematic)","note":"点位为城镇级近似坐标；点间连线为直线示意，不代表实际道路。status: verified=有来源直接写明, book=《Giant Steps》书内日记, inferred=按道路/距离/日期推断或坐标示意。","features":feats}
json.dump(gj,open('route.geojson','w'),ensure_ascii=False,indent=1)
compact=dict(pts=[[p['n'],round(p['lon'],3),round(p['lat'],3),p['d'],p['s'],p['seg'],p['m']] for p in pts],
  turk=[[x[2],x[1]] for x in TURK], dc=[[x[2],x[1],x[0],x[3]] for x in DC],
  tr=[[lab,k,[[c[1],c[0]] for c in cs],note,case] for lab,k,cs,note,case in T], seg=SEGNAME)
json.dump(compact,open('route_compact.json','w'),ensure_ascii=False,separators=(',',':'))
# rivers
d=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'ne_10m_rivers_lake_centerlines.geojson'))
keep={'Lena','Aldan','Atrato','Yukon','Tanana','Kolyma','Thames','Danube','Amur','Amu Darya','Syr Darya','Mackenzie','Indigirka'}
fs=[]
for f in d['features']:
    if f['properties'].get('name') in keep:
        g=f['geometry']
        def r(c): return [[round(x,3),round(y,3)] for x,y in c]
        if g['type']=='LineString': g['coordinates']=r(g['coordinates'])
        else: g['coordinates']=[r(c) for c in g['coordinates']]
        fs.append({"type":"Feature","properties":{"n":f['properties']['name']},"geometry":g})
json.dump({"type":"FeatureCollection","features":fs},open('rivers.json','w'),separators=(',',':'))
print(len(pts),'points; rivers',len(fs))
