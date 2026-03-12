'use client';
import { useState } from 'react';

const CITIES: Record<string, {code: string, name: string}[]> = {
  '01':[{code:'01100',name:'札幌市'},{code:'01202',name:'函館市'},{code:'01203',name:'小樽市'},{code:'01204',name:'旭川市'},{code:'01205',name:'室蘭市'},{code:'01206',name:'釧路市'},{code:'01207',name:'帯広市'},{code:'01208',name:'北見市'},{code:'01210',name:'岩見沢市'},{code:'01212',name:'留萌市'}],
  '02':[{code:'02201',name:'青森市'},{code:'02202',name:'弘前市'},{code:'02203',name:'八戸市'},{code:'02204',name:'黒石市'},{code:'02205',name:'五所川原市'},{code:'02206',name:'十和田市'}],
  '03':[{code:'03201',name:'盛岡市'},{code:'03202',name:'宮古市'},{code:'03203',name:'大船渡市'},{code:'03205',name:'花巻市'},{code:'03206',name:'北上市'},{code:'03207',name:'久慈市'},{code:'03208',name:'遠野市'},{code:'03209',name:'一関市'}],
  '04':[{code:'04100',name:'仙台市'},{code:'04202',name:'石巻市'},{code:'04203',name:'塩竈市'},{code:'04205',name:'気仙沼市'},{code:'04206',name:'白石市'},{code:'04207',name:'名取市'},{code:'04208',name:'角田市'},{code:'04209',name:'多賀城市'}],
  '05':[{code:'05201',name:'秋田市'},{code:'05202',name:'能代市'},{code:'05203',name:'横手市'},{code:'05204',name:'大館市'},{code:'05206',name:'男鹿市'},{code:'05207',name:'湯沢市'}],
  '06':[{code:'06201',name:'山形市'},{code:'06202',name:'米沢市'},{code:'06203',name:'鶴岡市'},{code:'06204',name:'酒田市'},{code:'06205',name:'新庄市'},{code:'06206',name:'寒河江市'}],
  '07':[{code:'07201',name:'福島市'},{code:'07202',name:'会津若松市'},{code:'07203',name:'郡山市'},{code:'07204',name:'いわき市'},{code:'07205',name:'白河市'},{code:'07208',name:'須賀川市'}],
  '08':[{code:'08201',name:'水戸市'},{code:'08202',name:'日立市'},{code:'08203',name:'土浦市'},{code:'08204',name:'古河市'},{code:'08205',name:'石岡市'},{code:'08207',name:'結城市'},{code:'08210',name:'龍ケ崎市'},{code:'08211',name:'下妻市'},{code:'08212',name:'常総市'},{code:'08213',name:'常陸太田市'},{code:'08215',name:'高萩市'},{code:'08216',name:'北茨城市'},{code:'08217',name:'笠間市'},{code:'08218',name:'取手市'},{code:'08220',name:'牛久市'},{code:'08221',name:'つくば市'},{code:'08222',name:'ひたちなか市'},{code:'08223',name:'鹿嶋市'},{code:'08224',name:'潮来市'},{code:'08225',name:'守谷市'}],
  '09':[{code:'09201',name:'宇都宮市'},{code:'09202',name:'足利市'},{code:'09203',name:'栃木市'},{code:'09204',name:'佐野市'},{code:'09205',name:'鹿沼市'},{code:'09206',name:'日光市'},{code:'09208',name:'小山市'},{code:'09209',name:'真岡市'},{code:'09210',name:'大田原市'},{code:'09211',name:'矢板市'}],
  '10':[{code:'10201',name:'前橋市'},{code:'10202',name:'高崎市'},{code:'10203',name:'桐生市'},{code:'10204',name:'伊勢崎市'},{code:'10205',name:'太田市'},{code:'10206',name:'沼田市'},{code:'10207',name:'館林市'},{code:'10208',name:'渋川市'},{code:'10209',name:'藤岡市'},{code:'10210',name:'富岡市'}],
  '11':[{code:'11100',name:'さいたま市'},{code:'11202',name:'川越市'},{code:'11203',name:'熊谷市'},{code:'11204',name:'川口市'},{code:'11206',name:'行田市'},{code:'11208',name:'所沢市'},{code:'11214',name:'春日部市'},{code:'11215',name:'狭山市'},{code:'11221',name:'草加市'},{code:'11222',name:'越谷市'},{code:'11223',name:'蕨市'},{code:'11224',name:'戸田市'},{code:'11225',name:'入間市'},{code:'11227',name:'朝霞市'},{code:'11230',name:'新座市'},{code:'11237',name:'三郷市'}],
  '12':[{code:'12100',name:'千葉市'},{code:'12202',name:'銚子市'},{code:'12203',name:'市川市'},{code:'12204',name:'船橋市'},{code:'12207',name:'松戸市'},{code:'12208',name:'野田市'},{code:'12211',name:'成田市'},{code:'12212',name:'佐倉市'},{code:'12216',name:'習志野市'},{code:'12217',name:'柏市'},{code:'12219',name:'市原市'},{code:'12220',name:'流山市'},{code:'12221',name:'八千代市'},{code:'12222',name:'我孫子市'},{code:'12224',name:'鎌ケ谷市'},{code:'12227',name:'浦安市'}],
  '13':[{code:'13101',name:'千代田区'},{code:'13102',name:'中央区'},{code:'13103',name:'港区'},{code:'13104',name:'新宿区'},{code:'13105',name:'文京区'},{code:'13106',name:'台東区'},{code:'13107',name:'墨田区'},{code:'13108',name:'江東区'},{code:'13109',name:'品川区'},{code:'13110',name:'目黒区'},{code:'13111',name:'大田区'},{code:'13112',name:'世田谷区'},{code:'13113',name:'渋谷区'},{code:'13114',name:'中野区'},{code:'13115',name:'杉並区'},{code:'13116',name:'豊島区'},{code:'13117',name:'北区'},{code:'13118',name:'荒川区'},{code:'13119',name:'板橋区'},{code:'13120',name:'練馬区'},{code:'13121',name:'足立区'},{code:'13122',name:'葛飾区'},{code:'13123',name:'江戸川区'},{code:'13201',name:'八王子市'},{code:'13202',name:'立川市'},{code:'13203',name:'武蔵野市'},{code:'13204',name:'三鷹市'},{code:'13205',name:'青梅市'},{code:'13206',name:'府中市'},{code:'13207',name:'昭島市'},{code:'13208',name:'調布市'},{code:'13209',name:'町田市'},{code:'13210',name:'小金井市'},{code:'13213',name:'東村山市'},{code:'13214',name:'国分寺市'},{code:'13224',name:'多摩市'}],
  '14':[{code:'14100',name:'横浜市'},{code:'14130',name:'川崎市'},{code:'14150',name:'相模原市'},{code:'14201',name:'横須賀市'},{code:'14203',name:'平塚市'},{code:'14204',name:'鎌倉市'},{code:'14205',name:'藤沢市'},{code:'14206',name:'小田原市'},{code:'14207',name:'茅ヶ崎市'},{code:'14208',name:'逗子市'},{code:'14210',name:'三浦市'},{code:'14211',name:'秦野市'},{code:'14212',name:'厚木市'},{code:'14213',name:'大和市'},{code:'14215',name:'海老名市'},{code:'14216',name:'座間市'},{code:'14218',name:'綾瀬市'}],
  '15':[{code:'15100',name:'新潟市'},{code:'15202',name:'長岡市'},{code:'15204',name:'三条市'},{code:'15205',name:'柏崎市'},{code:'15206',name:'新発田市'},{code:'15208',name:'小千谷市'},{code:'15209',name:'加茂市'},{code:'15210',name:'十日町市'},{code:'15214',name:'見附市'},{code:'15215',name:'村上市'},{code:'15216',name:'燕市'},{code:'15220',name:'糸魚川市'},{code:'15221',name:'妙高市'},{code:'15222',name:'五泉市'},{code:'15224',name:'上越市'},{code:'15225',name:'阿賀野市'},{code:'15226',name:'佐渡市'},{code:'15227',name:'魚沼市'},{code:'15228',name:'南魚沼市'},{code:'15229',name:'胎内市'}],
  '16':[{code:'16201',name:'富山市'},{code:'16202',name:'高岡市'},{code:'16204',name:'魚津市'},{code:'16205',name:'氷見市'},{code:'16206',name:'滑川市'},{code:'16207',name:'黒部市'},{code:'16208',name:'砺波市'},{code:'16209',name:'小矢部市'},{code:'16210',name:'南砺市'},{code:'16211',name:'射水市'}],
  '17':[{code:'17201',name:'金沢市'},{code:'17202',name:'七尾市'},{code:'17203',name:'小松市'},{code:'17204',name:'輪島市'},{code:'17205',name:'珠洲市'},{code:'17206',name:'加賀市'},{code:'17207',name:'羽咋市'},{code:'17209',name:'かほく市'},{code:'17210',name:'白山市'},{code:'17211',name:'能美市'},{code:'17212',name:'野々市市'}],
  '18':[{code:'18201',name:'福井市'},{code:'18202',name:'敦賀市'},{code:'18204',name:'小浜市'},{code:'18205',name:'大野市'},{code:'18206',name:'勝山市'},{code:'18207',name:'鯖江市'},{code:'18208',name:'あわら市'},{code:'18209',name:'越前市'},{code:'18210',name:'坂井市'}],
  '19':[{code:'19201',name:'甲府市'},{code:'19202',name:'富士吉田市'},{code:'19204',name:'都留市'},{code:'19205',name:'山梨市'},{code:'19206',name:'大月市'},{code:'19207',name:'韮崎市'},{code:'19208',name:'南アルプス市'},{code:'19209',name:'北杜市'},{code:'19210',name:'甲斐市'},{code:'19211',name:'笛吹市'},{code:'19213',name:'上野原市'},{code:'19214',name:'甲州市'},{code:'19215',name:'中央市'}],
  '20':[{code:'20201',name:'長野市'},{code:'20202',name:'松本市'},{code:'20203',name:'上田市'},{code:'20204',name:'岡谷市'},{code:'20205',name:'飯田市'},{code:'20206',name:'諏訪市'},{code:'20207',name:'須坂市'},{code:'20208',name:'小諸市'},{code:'20209',name:'伊那市'},{code:'20210',name:'駒ヶ根市'},{code:'20211',name:'中野市'},{code:'20212',name:'大町市'},{code:'20213',name:'飯山市'},{code:'20214',name:'茅野市'},{code:'20215',name:'塩尻市'},{code:'20217',name:'佐久市'},{code:'20218',name:'千曲市'},{code:'20219',name:'東御市'},{code:'20220',name:'安曇野市'}],
  '21':[{code:'21201',name:'岐阜市'},{code:'21202',name:'大垣市'},{code:'21203',name:'高山市'},{code:'21204',name:'多治見市'},{code:'21205',name:'関市'},{code:'21206',name:'中津川市'},{code:'21207',name:'美濃市'},{code:'21208',name:'瑞浪市'},{code:'21209',name:'羽島市'},{code:'21210',name:'恵那市'},{code:'21211',name:'美濃加茂市'},{code:'21212',name:'土岐市'},{code:'21213',name:'各務原市'},{code:'21214',name:'可児市'},{code:'21215',name:'山県市'},{code:'21216',name:'瑞穂市'},{code:'21217',name:'飛騨市'},{code:'21218',name:'本巣市'},{code:'21219',name:'郡上市'},{code:'21221',name:'下呂市'},{code:'21222',name:'海津市'}],
  '22':[{code:'22100',name:'静岡市'},{code:'22130',name:'浜松市'},{code:'22203',name:'沼津市'},{code:'22205',name:'熱海市'},{code:'22206',name:'三島市'},{code:'22207',name:'富士宮市'},{code:'22208',name:'伊東市'},{code:'22209',name:'島田市'},{code:'22210',name:'富士市'},{code:'22211',name:'磐田市'},{code:'22212',name:'焼津市'},{code:'22213',name:'掛川市'},{code:'22214',name:'藤枝市'},{code:'22215',name:'御殿場市'},{code:'22216',name:'袋井市'},{code:'22221',name:'裾野市'},{code:'22222',name:'湖西市'},{code:'22223',name:'伊豆市'},{code:'22224',name:'牧之原市'}],
  '23':[{code:'23100',name:'名古屋市'},{code:'23201',name:'豊橋市'},{code:'23202',name:'岡崎市'},{code:'23203',name:'一宮市'},{code:'23204',name:'瀬戸市'},{code:'23205',name:'半田市'},{code:'23206',name:'春日井市'},{code:'23207',name:'豊川市'},{code:'23209',name:'碧南市'},{code:'23210',name:'刈谷市'},{code:'23211',name:'豊田市'},{code:'23212',name:'安城市'},{code:'23213',name:'西尾市'},{code:'23214',name:'蒲郡市'},{code:'23215',name:'犬山市'},{code:'23217',name:'江南市'},{code:'23219',name:'小牧市'},{code:'23220',name:'稲沢市'},{code:'23222',name:'東海市'},{code:'23223',name:'大府市'},{code:'23224',name:'知多市'},{code:'23226',name:'尾張旭市'},{code:'23228',name:'岩倉市'},{code:'23229',name:'豊明市'},{code:'23230',name:'日進市'},{code:'23232',name:'愛西市'},{code:'23234',name:'北名古屋市'},{code:'23236',name:'みよし市'},{code:'23237',name:'あま市'},{code:'23238',name:'長久手市'}],
  '24':[{code:'24201',name:'津市'},{code:'24202',name:'四日市市'},{code:'24203',name:'伊勢市'},{code:'24204',name:'松阪市'},{code:'24205',name:'桑名市'},{code:'24207',name:'鈴鹿市'},{code:'24208',name:'名張市'},{code:'24209',name:'尾鷲市'},{code:'24210',name:'亀山市'},{code:'24211',name:'鳥羽市'},{code:'24212',name:'熊野市'},{code:'24214',name:'いなべ市'},{code:'24215',name:'志摩市'},{code:'24216',name:'伊賀市'}],
  '25':[{code:'25201',name:'大津市'},{code:'25202',name:'彦根市'},{code:'25203',name:'長浜市'},{code:'25204',name:'近江八幡市'},{code:'25206',name:'草津市'},{code:'25207',name:'守山市'},{code:'25208',name:'栗東市'},{code:'25209',name:'甲賀市'},{code:'25210',name:'野洲市'},{code:'25211',name:'湖南市'},{code:'25212',name:'高島市'},{code:'25213',name:'東近江市'},{code:'25214',name:'米原市'}],
  '26':[{code:'26100',name:'京都市'},{code:'26201',name:'福知山市'},{code:'26202',name:'舞鶴市'},{code:'26203',name:'綾部市'},{code:'26204',name:'宇治市'},{code:'26205',name:'宮津市'},{code:'26206',name:'亀岡市'},{code:'26207',name:'城陽市'},{code:'26208',name:'向日市'},{code:'26209',name:'長岡京市'},{code:'26210',name:'八幡市'},{code:'26211',name:'京田辺市'},{code:'26212',name:'京丹後市'},{code:'26213',name:'南丹市'},{code:'26214',name:'木津川市'}],
  '27':[{code:'27100',name:'大阪市'},{code:'27140',name:'堺市'},{code:'27202',name:'岸和田市'},{code:'27203',name:'豊中市'},{code:'27204',name:'池田市'},{code:'27205',name:'吹田市'},{code:'27207',name:'高槻市'},{code:'27208',name:'貝塚市'},{code:'27209',name:'守口市'},{code:'27210',name:'枚方市'},{code:'27211',name:'茨木市'},{code:'27212',name:'八尾市'},{code:'27213',name:'泉佐野市'},{code:'27214',name:'富田林市'},{code:'27215',name:'寝屋川市'},{code:'27216',name:'河内長野市'},{code:'27217',name:'松原市'},{code:'27218',name:'大東市'},{code:'27219',name:'和泉市'},{code:'27220',name:'箕面市'},{code:'27222',name:'羽曳野市'},{code:'27223',name:'門真市'},{code:'27224',name:'摂津市'},{code:'27227',name:'東大阪市'},{code:'27228',name:'泉南市'},{code:'27231',name:'大阪狭山市'},{code:'27232',name:'阪南市'}],
  '28':[{code:'28100',name:'神戸市'},{code:'28201',name:'姫路市'},{code:'28202',name:'尼崎市'},{code:'28203',name:'明石市'},{code:'28204',name:'西宮市'},{code:'28205',name:'洲本市'},{code:'28206',name:'芦屋市'},{code:'28207',name:'伊丹市'},{code:'28208',name:'相生市'},{code:'28209',name:'豊岡市'},{code:'28210',name:'加古川市'},{code:'28212',name:'赤穂市'},{code:'28213',name:'西脇市'},{code:'28214',name:'宝塚市'},{code:'28215',name:'三木市'},{code:'28216',name:'高砂市'},{code:'28217',name:'川西市'},{code:'28218',name:'小野市'},{code:'28219',name:'三田市'},{code:'28220',name:'加西市'},{code:'28224',name:'南あわじ市'},{code:'28225',name:'朝来市'},{code:'28226',name:'淡路市'},{code:'28227',name:'宍粟市'},{code:'28228',name:'加東市'},{code:'28229',name:'たつの市'}],
  '29':[{code:'29201',name:'奈良市'},{code:'29202',name:'大和高田市'},{code:'29203',name:'大和郡山市'},{code:'29204',name:'天理市'},{code:'29205',name:'橿原市'},{code:'29206',name:'桜井市'},{code:'29207',name:'五條市'},{code:'29208',name:'御所市'},{code:'29209',name:'生駒市'},{code:'29210',name:'香芝市'},{code:'29211',name:'葛城市'},{code:'29212',name:'宇陀市'}],
  '30':[{code:'30201',name:'和歌山市'},{code:'30202',name:'海南市'},{code:'30203',name:'橋本市'},{code:'30204',name:'有田市'},{code:'30205',name:'御坊市'},{code:'30206',name:'田辺市'},{code:'30207',name:'新宮市'},{code:'30208',name:'紀の川市'},{code:'30209',name:'岩出市'}],
  '31':[{code:'31201',name:'鳥取市'},{code:'31202',name:'米子市'},{code:'31203',name:'倉吉市'},{code:'31204',name:'境港市'}],
  '32':[{code:'32201',name:'松江市'},{code:'32202',name:'浜田市'},{code:'32203',name:'出雲市'},{code:'32204',name:'益田市'},{code:'32205',name:'大田市'},{code:'32206',name:'安来市'},{code:'32207',name:'江津市'},{code:'32209',name:'雲南市'}],
  '33':[{code:'33100',name:'岡山市'},{code:'33202',name:'倉敷市'},{code:'33203',name:'津山市'},{code:'33204',name:'玉野市'},{code:'33205',name:'笠岡市'},{code:'33207',name:'井原市'},{code:'33208',name:'総社市'},{code:'33209',name:'高梁市'},{code:'33210',name:'新見市'},{code:'33211',name:'備前市'},{code:'33212',name:'瀬戸内市'},{code:'33213',name:'赤磐市'},{code:'33214',name:'真庭市'},{code:'33215',name:'美作市'},{code:'33216',name:'浅口市'}],
  '34':[{code:'34100',name:'広島市'},{code:'34202',name:'呉市'},{code:'34203',name:'竹原市'},{code:'34204',name:'三原市'},{code:'34205',name:'尾道市'},{code:'34207',name:'福山市'},{code:'34208',name:'府中市'},{code:'34209',name:'三次市'},{code:'34210',name:'庄原市'},{code:'34211',name:'大竹市'},{code:'34212',name:'東広島市'},{code:'34213',name:'廿日市市'},{code:'34214',name:'安芸高田市'},{code:'34215',name:'江田島市'}],
  '35':[{code:'35201',name:'下関市'},{code:'35202',name:'宇部市'},{code:'35203',name:'山口市'},{code:'35204',name:'萩市'},{code:'35206',name:'防府市'},{code:'35207',name:'下松市'},{code:'35208',name:'岩国市'},{code:'35210',name:'光市'},{code:'35211',name:'長門市'},{code:'35212',name:'柳井市'},{code:'35213',name:'美祢市'},{code:'35215',name:'周南市'},{code:'35216',name:'山陽小野田市'}],
  '36':[{code:'36201',name:'徳島市'},{code:'36202',name:'鳴門市'},{code:'36203',name:'小松島市'},{code:'36204',name:'阿南市'},{code:'36205',name:'吉野川市'},{code:'36206',name:'阿波市'},{code:'36207',name:'美馬市'},{code:'36208',name:'三好市'}],
  '37':[{code:'37201',name:'高松市'},{code:'37202',name:'丸亀市'},{code:'37203',name:'坂出市'},{code:'37204',name:'善通寺市'},{code:'37205',name:'観音寺市'},{code:'37206',name:'さぬき市'},{code:'37207',name:'東かがわ市'},{code:'37208',name:'三豊市'}],
  '38':[{code:'38201',name:'松山市'},{code:'38202',name:'今治市'},{code:'38203',name:'宇和島市'},{code:'38204',name:'八幡浜市'},{code:'38205',name:'新居浜市'},{code:'38206',name:'西条市'},{code:'38207',name:'大洲市'},{code:'38210',name:'伊予市'},{code:'38213',name:'四国中央市'},{code:'38214',name:'西予市'},{code:'38215',name:'東温市'}],
  '39':[{code:'39201',name:'高知市'},{code:'39202',name:'室戸市'},{code:'39203',name:'安芸市'},{code:'39204',name:'南国市'},{code:'39205',name:'土佐市'},{code:'39206',name:'須崎市'},{code:'39208',name:'宿毛市'},{code:'39209',name:'土佐清水市'},{code:'39210',name:'四万十市'},{code:'39211',name:'香南市'},{code:'39212',name:'香美市'}],
  '40':[{code:'40100',name:'北九州市'},{code:'40130',name:'福岡市'},{code:'40203',name:'大牟田市'},{code:'40204',name:'久留米市'},{code:'40205',name:'直方市'},{code:'40206',name:'飯塚市'},{code:'40207',name:'田川市'},{code:'40208',name:'柳川市'},{code:'40210',name:'八女市'},{code:'40211',name:'筑後市'},{code:'40212',name:'大川市'},{code:'40213',name:'行橋市'},{code:'40214',name:'豊前市'},{code:'40215',name:'中間市'},{code:'40216',name:'小郡市'},{code:'40217',name:'筑紫野市'},{code:'40218',name:'春日市'},{code:'40219',name:'大野城市'},{code:'40220',name:'宗像市'},{code:'40221',name:'太宰府市'},{code:'40223',name:'古賀市'},{code:'40224',name:'福津市'},{code:'40225',name:'うきは市'},{code:'40227',name:'嘉麻市'},{code:'40228',name:'朝倉市'},{code:'40230',name:'糸島市'},{code:'40231',name:'那珂川市'}],
  '41':[{code:'41201',name:'佐賀市'},{code:'41202',name:'唐津市'},{code:'41203',name:'鳥栖市'},{code:'41204',name:'多久市'},{code:'41205',name:'伊万里市'},{code:'41206',name:'武雄市'},{code:'41207',name:'鹿島市'},{code:'41208',name:'小城市'},{code:'41209',name:'嬉野市'},{code:'41210',name:'神埼市'}],
  '42':[{code:'42201',name:'長崎市'},{code:'42202',name:'佐世保市'},{code:'42203',name:'島原市'},{code:'42204',name:'諫早市'},{code:'42205',name:'大村市'},{code:'42207',name:'平戸市'},{code:'42208',name:'松浦市'},{code:'42209',name:'対馬市'},{code:'42210',name:'壱岐市'},{code:'42211',name:'五島市'},{code:'42212',name:'西海市'},{code:'42213',name:'雲仙市'},{code:'42214',name:'南島原市'}],
  '43':[{code:'43100',name:'熊本市'},{code:'43202',name:'八代市'},{code:'43203',name:'人吉市'},{code:'43204',name:'荒尾市'},{code:'43205',name:'水俣市'},{code:'43206',name:'玉名市'},{code:'43208',name:'山鹿市'},{code:'43209',name:'菊池市'},{code:'43210',name:'宇土市'},{code:'43211',name:'上天草市'},{code:'43212',name:'宇城市'},{code:'43213',name:'阿蘇市'},{code:'43214',name:'天草市'},{code:'43215',name:'合志市'}],
  '44':[{code:'44201',name:'大分市'},{code:'44202',name:'別府市'},{code:'44203',name:'中津市'},{code:'44204',name:'日田市'},{code:'44205',name:'佐伯市'},{code:'44206',name:'臼杵市'},{code:'44207',name:'津久見市'},{code:'44208',name:'竹田市'},{code:'44209',name:'豊後高田市'},{code:'44210',name:'杵築市'},{code:'44211',name:'宇佐市'},{code:'44212',name:'豊後大野市'},{code:'44213',name:'由布市'},{code:'44214',name:'国東市'}],
  '45':[{code:'45201',name:'宮崎市'},{code:'45202',name:'都城市'},{code:'45203',name:'延岡市'},{code:'45204',name:'日南市'},{code:'45205',name:'小林市'},{code:'45206',name:'日向市'},{code:'45207',name:'串間市'},{code:'45208',name:'西都市'},{code:'45209',name:'えびの市'}],
  '46':[{code:'46201',name:'鹿児島市'},{code:'46203',name:'鹿屋市'},{code:'46204',name:'枕崎市'},{code:'46206',name:'阿久根市'},{code:'46208',name:'出水市'},{code:'46210',name:'指宿市'},{code:'46213',name:'西之表市'},{code:'46214',name:'垂水市'},{code:'46215',name:'薩摩川内市'},{code:'46216',name:'日置市'},{code:'46217',name:'曽於市'},{code:'46218',name:'霧島市'},{code:'46219',name:'いちき串木野市'},{code:'46220',name:'南さつま市'},{code:'46222',name:'志布志市'},{code:'46223',name:'奄美市'},{code:'46224',name:'南九州市'},{code:'46225',name:'伊佐市'},{code:'46226',name:'姶良市'}],
  '47':[{code:'47201',name:'那覇市'},{code:'47202',name:'宜野湾市'},{code:'47204',name:'石垣市'},{code:'47205',name:'浦添市'},{code:'47206',name:'名護市'},{code:'47207',name:'糸満市'},{code:'47208',name:'沖縄市'},{code:'47209',name:'豊見城市'},{code:'47210',name:'うるま市'},{code:'47211',name:'宮古島市'},{code:'47212',name:'南城市'}],
};

const PREFS = [
  {code:'01',name:'北海道'},{code:'02',name:'青森県'},{code:'03',name:'岩手県'},
  {code:'04',name:'宮城県'},{code:'05',name:'秋田県'},{code:'06',name:'山形県'},
  {code:'07',name:'福島県'},{code:'08',name:'茨城県'},{code:'09',name:'栃木県'},
  {code:'10',name:'群馬県'},{code:'11',name:'埼玉県'},{code:'12',name:'千葉県'},
  {code:'13',name:'東京都'},{code:'14',name:'神奈川県'},{code:'15',name:'新潟県'},
  {code:'16',name:'富山県'},{code:'17',name:'石川県'},{code:'18',name:'福井県'},
  {code:'19',name:'山梨県'},{code:'20',name:'長野県'},{code:'21',name:'岐阜県'},
  {code:'22',name:'静岡県'},{code:'23',name:'愛知県'},{code:'24',name:'三重県'},
  {code:'25',name:'滋賀県'},{code:'26',name:'京都府'},{code:'27',name:'大阪府'},
  {code:'28',name:'兵庫県'},{code:'29',name:'奈良県'},{code:'30',name:'和歌山県'},
  {code:'31',name:'鳥取県'},{code:'32',name:'島根県'},{code:'33',name:'岡山県'},
  {code:'34',name:'広島県'},{code:'35',name:'山口県'},{code:'36',name:'徳島県'},
  {code:'37',name:'香川県'},{code:'38',name:'愛媛県'},{code:'39',name:'高知県'},
  {code:'40',name:'福岡県'},{code:'41',name:'佐賀県'},{code:'42',name:'長崎県'},
  {code:'43',name:'熊本県'},{code:'44',name:'大分県'},{code:'45',name:'宮崎県'},
  {code:'46',name:'鹿児島県'},{code:'47',name:'沖縄県'},
];

type PopData = { year: number; pop: number };

export default function PopulationPage() {
  const [prefCode, setPrefCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [popData, setPopData] = useState<PopData[]>([]);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!cityCode) return;
    setLoading(true);
    const res = await fetch(`/api/population?cityCode=${cityCode}`);
    const data = await res.json();
    setPopData(data.popData);
    const city = CITIES[prefCode]?.find(c => c.code === cityCode);
    setCityName(city?.name || '');
    setLoading(false);
  };

  const maxPop = popData.length > 0 ? Math.max(...popData.map(d => d.pop)) : 1;
  const peak = popData.length > 0 ? popData.reduce((a, b) => a.pop > b.pop ? a : b) : null;
  const latest = popData.length > 0 ? popData[popData.length - 1] : null;
  const oldest = popData.length > 0 ? popData[0] : null;
  const change = latest && oldest ? ((latest.pop - oldest.pop) / oldest.pop * 100).toFixed(1) : null;

  return (
    <main style={{minHeight: '100vh', background: '#0a0e1a', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column'}}>
      <style>{`
        select { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 12px 16px; color: #e8edf5; font-size: 14px; outline: none; }
        select:focus { border-color: #00d4aa; }
        .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .bar-label { font-family: monospace; font-size: 11px; color: #6b7a99; width: 40px; text-align: right; }
        .bar-bg { flex: 1; background: #1e2d45; border-radius: 4px; height: 28px; }
        .bar-fill { background: #00d4aa; border-radius: 4px; height: 28px; display: flex; align-items: center; padding-left: 8px; font-size: 11px; font-family: monospace; color: #0a0e1a; font-weight: 700; transition: width 0.5s; }
        .kpi { background: #111827; border: 1px solid #1e2d45; border-radius: 12px; padding: 16px 20px; }
        @media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr 1fr !important; } .selects { flex-direction: column !important; } }
      `}</style>

      <header style={{padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)'}}>
        <a href="/" style={{fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5'}}>
          AREA<span style={{color: '#00d4aa'}}>SCOPE</span>
        </a>
        <a href="/station" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>🚃 乗降客数</a>
      </header>

      <section style={{flex: 1, padding: '40px 32px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box'}}>
        <div style={{fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px'}}>// 市区町村別人口推移</div>
        <h1 style={{fontSize: '32px', fontWeight: 800, marginBottom: '32px'}}>人口推移<span style={{color: '#00d4aa'}}>データ</span></h1>

        <div className="selects" style={{display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap'}}>
          <select value={prefCode} onChange={e => { setPrefCode(e.target.value); setCityCode(''); }} style={{flex: 1, minWidth: '160px'}}>
            <option value="">都道府県を選択</option>
            {PREFS.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
          <select value={cityCode} onChange={e => setCityCode(e.target.value)} style={{flex: 1, minWidth: '160px'}} disabled={!prefCode}>
            <option value="">市区町村を選択</option>
            {(CITIES[prefCode] || []).map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <button onClick={analyze} disabled={!cityCode || loading}
            style={{background: '#00d4aa', color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', opacity: !cityCode ? 0.5 : 1}}>
            {loading ? '取得中...' : '分析する →'}
          </button>
        </div>

        {popData.length > 0 && (
          <>
            <div style={{marginBottom: '24px'}}>
              <div style={{fontSize: '24px', fontWeight: 800}}>{cityName}</div>
              <div style={{fontSize: '12px', color: '#6b7a99', marginTop: '4px', fontFamily: 'monospace'}}>1995〜2020年 国勢調査データ（e-Stat API）</div>
            </div>

            <div className="kpi-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px'}}>
              <div className="kpi">
                <div style={{fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px'}}>最新人口（{latest?.year}年）</div>
                <div style={{fontSize: '28px', fontWeight: 800, color: '#00d4aa'}}>{latest?.pop.toLocaleString()}</div>
                <div style={{fontSize: '11px', color: '#6b7a99'}}>人</div>
              </div>
              <div className="kpi">
                <div style={{fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px'}}>人口ピーク年</div>
                <div style={{fontSize: '28px', fontWeight: 800}}>{peak?.year}年</div>
                <div style={{fontSize: '11px', color: '#6b7a99'}}>{peak?.pop.toLocaleString()}人</div>
              </div>
              <div className="kpi">
                <div style={{fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px'}}>長期変化（1995年比）</div>
                <div style={{fontSize: '28px', fontWeight: 800, color: parseFloat(change||'0') >= 0 ? '#00d4aa' : '#ff4757'}}>
                  {parseFloat(change||'0') >= 0 ? '▲' : '▼'}{Math.abs(parseFloat(change||'0'))}%
                </div>
                <div style={{fontSize: '11px', color: '#6b7a99'}}>{oldest?.pop.toLocaleString()}人 → {latest?.pop.toLocaleString()}人</div>
              </div>
            </div>

            <div style={{background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px'}}>
              <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '20px'}}>人口推移グラフ</div>
              {popData.map(d => (
                <div key={d.year} className="bar-row">
                  <div className="bar-label">{d.year}</div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{width: `${(d.pop / maxPop) * 100}%`}}>
                      {d.pop.toLocaleString()}人
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {popData.length === 0 && !loading && (
          <div style={{textAlign: 'center', color: '#6b7a99', marginTop: '60px'}}>
            <div style={{fontSize: '40px', marginBottom: '16px'}}>🏙️</div>
            <div>都道府県・市区町村を選んで分析してください</div>
          </div>
        )}
      </section>

      <footer style={{padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center'}}>
        出典: 総務省統計局 国勢調査（e-Stat API）| © 2025 AREASCOPE
      </footer>
    </main>
  );
}