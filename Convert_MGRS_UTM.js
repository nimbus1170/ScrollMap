//
// Convert_MGRS_UTM.cpp
// MGRS ⇔ UTM
//
// ◆南半球にも対応しているか？
//
//---------------------------------------------------------------------------
import {CLgLt} from "./LgLt.js"
import {CUTM} from "./UTM.js"
import {ToUTM, LgBandToCM} from "./Convert_LgLt_UTM.js"
//---------------------------------------------------------------------------
// 参考：https://www.wingfield.gr.jp/archives/6833

// 東西MGRS_ID
// ●IとOは欠番
const MGRS_ID_EW = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// 南北MGRS_ID
// ●IとOは欠番
// ●経度帯によりA～VとF～Eの2通りがあるが、まとめて定義し、開始位置をずらす。
const MGRS_ID_NS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'A', 'B', 'C', 'D', 'E'];

// 緯度帯
// ●緯度帯は8度ずつで最後のXは12度なので計算を複雑にしないようにXを2つ定義しておく。
const LtBands = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'X'];

//---------------------------------------------------------------------------
// 東西MGRSIDが指す100km単位の東西UTM座標を得る。
function GetUTM_EW_100km(lg_band, mgrs_id)
{
 	// 東西MGRSID(MGRSIDの1文字目)
	const mgrs_id_ew = mgrs_id.charAt(0);

	let mgrs_id_ew_i;

	// 当該MGRSID文字が存在するか確認する。
	for(mgrs_id_ew_i = 0; mgrs_id_ew_i < 24; ++mgrs_id_ew_i)
		if(MGRS_ID_EW[mgrs_id_ew_i] == mgrs_id_ew) break;

	// 見つからなかった。
	if(mgrs_id_ew_i == 24) throw "illegal MGRS ID EW";

	// 経度帯ごとの東西MGR文字の開始文字(A,J,S(インデックス0,8,16)のいずれか)に合わせる。
	mgrs_id_ew_i -= ((lg_band - 1) % 3) * 8;

	// 起点は0ではなく100,000
	return 100000 + mgrs_id_ew_i * 100000;
}
//---------------------------------------------------------------------------
// 南北MGRSIDが指す100km単位の南北UTM座標を得る。
function GetUTM_NS_100km(lg_band, lt_band, mgrs_id)
{
	//--------------------------------------------------

 	// 南北MGRSID(MGRSIDの2文字目)
	const mgrs_id_ns = mgrs_id.charAt(1);

	let mgrs_id_ns_i;

	// 南北MGRSIDは経度帯によりA,F(インデックス0,5)のいずれかから始まる。
	const mgrs_id_ns_start_index = ((lg_band % 2) == 1)? 0: 5;

	// 当該MGRSIDが存在するか確認する。
	for(mgrs_id_ns_i = 0; mgrs_id_ns_i < 20; ++mgrs_id_ns_i)
		if(MGRS_ID_NS[mgrs_id_ns_i + mgrs_id_ns_start_index] == mgrs_id_ns) break;

	// 見つからなかった。
	if(mgrs_id_ns_i == 20) throw "illegal MGRS ID NS";

	// 南北MGRSIDが指す100km単位南北UTM座標の候補
	// 南北MGRSIDは2000kmごとに繰り返されるため、これに2000kmを加えて行き、当該緯度帯に入るものが求める南北UTM座標となる。
	let utm_ns_100km = mgrs_id_ns_i * 100000;

	//--------------------------------------------------
	// 当該緯度帯に含まれる南北UTMを探す。

	let lt_bands_i;

	// 当該緯度帯文字が存在するか確認する。
	for(lt_bands_i = 0; lt_bands_i < 20; ++lt_bands_i)
		if(LtBands[lt_bands_i] == lt_band) break;

	// 見つからなかった。
	if(lt_bands_i == 20) throw "illegal lt band char";

	// 北半球では緯度帯N(起点であるCを0とした場合の10)から始まるので、Nを基準とするために差分を減ずる。
	// 南半球では緯度帯Cから始まるのでそのままで良い。
	if(lt_bands_i >= 10) lt_bands_i -= 10;

	// 中央子午線上の当該緯度帯の南限の経緯度
	// ◆南半球の場合、例えば緯度帯C(の南限)であれば、ToUTMには緯度0を与えることになるので南北UTMは0が返り、正しいので、ここで南北半球を区別する必要はない。
	// ◆正確には中央子午線上ではなく、当該経度上のものが必要では？
	const cm_lg = LgBandToCM(lg_band);
	const lt_band_lt = 8.0 * lt_bands_i;

	// 当該中央子午線上の当該緯度帯の南限のUTM
	const lt_band_utm_ns = ToUTM(new CLgLt(cm_lg, lt_band_lt)).ns;

	// 南北UTM座標候補に2000kmずつ加えて行き、当該緯度帯に入るものを得る。
	while(true)
	{
		// 当該緯度帯に入った。(当該緯度帯の南限UTM座標を越えた。)
		if(utm_ns_100km >= lt_band_utm_ns) break;

		utm_ns_100km += 2000000;
	}

	return utm_ns_100km;
}
//---------------------------------------------------------------------------
export function MakeUTM(lg_band, lt_band, mgrs_id, mgrs_ew, mgrs_ns)
{
	// MGRSIDが指す100km単位の座標に、100km未満の下5桁を加算する。
	const utm_ew = GetUTM_EW_100km(lg_band,			 mgrs_id) + mgrs_ew;
	const utm_ns = GetUTM_NS_100km(lg_band, lt_band, mgrs_id) + mgrs_ns;

	return new CUTM(lg_band, (lt_band.charCodeAt(0) >= "N".charCodeAt(0))? "n": "s", utm_ew, utm_ns);
}
//---------------------------------------------------------------------------
export function GetLtBand(lt)
{
	// 緯度帯は南緯80度(-80)から始まり北緯84度まで8度毎(最後のXは12度)
	// https://www.gsi.go.jp/chubu/minichishiki10.html

	const lt_band_n = Math.floor(Math.floor(lt + 80) / 8);

	return LtBands[lt_band_n];
}
//---------------------------------------------------------------------------
export function GetMGRS_ID(utm)
{
	const lg_band = utm.lg_band;
	const utm_ew  = utm.ew;
	const utm_ns  = utm.ns;

	//--------------------------------------------------
	// 東西MGRSIDを求める。

	// 起点は0ではなく100,000
	let mgrs_id_ew_i = Math.floor((utm_ew - 100000) / 100000.0);

	// MGRSID東西文字の開始インデックス(経度帯により0,8,16(A,J,S)のいずれか)を加える。
	mgrs_id_ew_i += ((lg_band - 1) % 3) * 8;

	if((mgrs_id_ew_i < 0) || (24 < mgrs_id_ew_i)) throw "UTM EW out of range";

	const mgrs_id_ew = MGRS_ID_EW[mgrs_id_ew_i];

	//--------------------------------------------------
	// 南北MGRSIDを求める。

	// 緯度帯はCからXまで2000kmずつ繰り返しているので、2000km未満の値をインデックスにする。
	// CからXまで南北半球にわたって連続しているので南北半球で区別する必要はない。
	let mgrs_id_ns_i = Math.floor((Math.floor(utm_ns) % 2000000) / 100000);

	// ◆上の計算でこの範囲入るのでは？
	if((mgrs_id_ns_i < 0) || (20 < mgrs_id_ns_i)) throw "UTM NS out of range";

	// 南北MGRSIDは経度帯によりA,F(インデックス0,5)のいずれかから始まる。
	const mgrs_id_ns = MGRS_ID_NS[mgrs_id_ns_i + (((lg_band % 2) == 1)? 0: 5)];

	//--------------------------------------------------

	return mgrs_id_ew + mgrs_id_ns;
}
//---------------------------------------------------------------------------
export function GetMGRS_EW(utm){ return ((Math.trunc(utm.ew)) % 100000) + (utm.ew - Math.floor(utm.ew));}
export function GetMGRS_NS(utm){ return ((Math.trunc(utm.ns)) % 100000) + (utm.ns - Math.floor(utm.ns));}
//---------------------------------------------------------------------------
