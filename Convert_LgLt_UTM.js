//
// ConvertLgLt_UTM.js
//
//---------------------------------------------------------------------------
// ◆CORS Polycyのため、サーバ環境でないと外部ファイルに分割できない。
import {CLgLt} from "./LgLt.js";
import {CUTM} from "./UTM.js";
//---------------------------------------------------------------------------

// 定数

const ellipsoid_GRS80_a  = 6378137.0;
const ellipsoid_GRS80_f  = 1.0 / 298.257222101;
const ellipsoid_GRS80_f2 = ellipsoid_GRS80_f / (1.0 - ellipsoid_GRS80_f); // 第2扁平率

const E0 = 500000.0; // 中央子午線からのオフセット(500km)
const k0 = 0.9996;	 // 縮尺係数

// 初期値

const n = ellipsoid_GRS80_f / (2.0 - ellipsoid_GRS80_f2);

// 計算用

const n2 = n * n;
const n3 = n * n * n;
const n4 = n * n * n * n;

const A = ellipsoid_GRS80_a / (1.0 + n) * (1.0 + n2 / 4.0 + n4 / 64.0);

const alpha1 = 1.0 /  2.0 * n - 2.0 / 3.0 * n2 + 5.0 / 16.0 * n3;
const alpha2 = 13.0 / 48.0 * n2 - 3.0 / 5.0 * n3;
const alpha3 = 61.0 / 240.0 * n3;

const beta1  = 1.0 / 2.0 * n - 2.0 / 3.0 * n2 + 37.0 / 96.0 * n3;
const beta2  = 1.0 / 48.0 * n2 + 1.0 / 15.0 * n3;
const beta3  = 17.0 / 480.0 * n3;

const delta1 = 2.0 * n - 2.0 / 3.0 * n2 - 2.0 * n3;
const delta2 = 7.0 / 3.0 * n2 - 8.0 / 5.0 * n3;
const delta3 = 56.0 / 15.0 * n3;

//---------------------------------------------------------------------------
export function ToUTM(lglt)
{
	// Wikipedia「ユニバーサル横メルカトル図法」の計算式
	// https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E6%A8%AA%E3%83%A1%E3%83%AB%E3%82%AB%E3%83%88%E3%83%AB%E5%9B%B3%E6%B3%95#cite_note-3

	//--------------------------------------------------
	// 定数

	const N0 = (lglt.lt >= 0.0)? 0.0: 10000000.0;

	//--------------------------------------------------
	// 経緯度等

	const lambda = Math.PI * lglt.lg / 180.0;
	const phi    = Math.PI * lglt.lt / 180.0;

	const lambda0 = Math.PI * LgBandToCM(GetLgBand(lglt.lg)) / 180.0;

	//--------------------------------------------------
	// 中間変数

	const t = Math.sinh(Math.atanh(Math.sin(phi)) - 2.0 * Math.sqrt(n) / (1.0 + n) * Math.atanh(2.0 * Math.sqrt(n) / (1.0 + n) * Math.sin(phi)));
	const ksi2 = Math.atan(t / Math.cos(lambda - lambda0));
	const eta2 = Math.atanh(Math.sin(lambda - lambda0) / Math.sqrt(1.0 + t * t));

/*	const sigma = 1.0 + 2.0 * alpha1 * Math.cos(2.0 * ksi2) * Math.cosh(2.0 * eta2) 
					  + 4.0 * alpha2 * Math.cos(4.0 * ksi2) * Math.cosh(4.0 * eta2)
				 	  + 6.0 * alpha3 * Math.cos(6.0 * ksi2) * Math.cosh(6.0 * eta2);

	const tau	= 1.0 + 2.0 * alpha1 * Math.sin(2.0 * ksi2) * Math.sinh(2.0 * eta2) 
					  + 4.0 * alpha2 * Math.sin(4.0 * ksi2) * Math.sinh(4.0 * eta2)
					  + 6.0 * alpha3 * Math.sin(6.0 * ksi2) * Math.sinh(6.0 * eta2);*/

	//--------------------------------------------------
	// 変換

	const utm_ew = E0 + k0 * A * (eta2 + alpha1 * Math.cos(2.0 * ksi2) * Math.sinh(2.0 * eta2)
									   + alpha2 * Math.cos(4.0 * ksi2) * Math.sinh(4.0 * eta2)
									   + alpha3 * Math.cos(6.0 * ksi2) * Math.sinh(6.0 * eta2));

	const utm_ns = N0 + k0 * A * (ksi2 + alpha1 * Math.sin(2.0 * ksi2) * Math.cosh(2.0 * eta2)
									   + alpha2 * Math.sin(4.0 * ksi2) * Math.cosh(4.0 * eta2)
									   + alpha3 * Math.sin(6.0 * ksi2) * Math.cosh(6.0 * eta2));

	//--------------------------------------------------

	return new CUTM(GetLgBand(lglt.lg), (lglt.lt >= 0.0)? "n": "s", utm_ew, utm_ns);
}
//---------------------------------------------------------------------------
export function ToLgLt(utm)
{
	// Wikipedia「ユニバーサル横メルカトル図法」の計算式
	// https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E6%A8%AA%E3%83%A1%E3%83%AB%E3%82%AB%E3%83%88%E3%83%AB%E5%9B%B3%E6%B3%95#cite_note-3

	//--------------------------------------------------
	// 定数

	const N0 = (utm.hemi == "n")? 0.0: 10000000.0;

	//--------------------------------------------------
	// 中間変数

	const ksi = (utm.ns - N0) / (k0 * A);
	const eta = (utm.ew - E0) / (k0 * A);

	// ◆倍角定理を使うべきか。

	const ksi2 = ksi - (  beta1 * Math.sin(2.0 * ksi) * Math.cosh(2.0 * eta)
						+ beta2 * Math.sin(4.0 * ksi) * Math.cosh(4.0 * eta)
						+ beta3 * Math.sin(6.0 * ksi) * Math.cosh(6.0 * eta));

	const eta2 = eta - (  beta1 * Math.cos(2.0 * ksi) * Math.sinh(2.0 * eta)
						+ beta2 * Math.cos(4.0 * ksi) * Math.sinh(4.0 * eta)
						+ beta3 * Math.cos(6.0 * ksi) * Math.sinh(6.0 * eta));

/*	const sigma2 = 1.0 - (  2.0 * beta1 * Math.cos(2.0 * ksi) * Math.cosh(2.0 * eta)
						  + 4.0 * beta2 * Math.cos(4.0 * ksi) * Math.cosh(4.0 * eta)
						  + 6.0 * beta3 * Math.cos(6.0 * ksi) * Math.cosh(6.0 * eta));

	const tau2	 = 1.0 - (  2.0 * beta1 * Math.sin(2.0 * ksi) * Math.sinh(2.0 * eta)
						  + 4.0 * beta2 * Math.sin(4.0 * ksi) * Math.sinh(4.0 * eta)
						  + 6.0 * beta3 * Math.sin(6.0 * ksi) * Math.sinh(6.0 * eta));*/

	const kai = Math.asin(Math.sin(ksi2) / Math.cosh(eta2));

	//--------------------------------------------------
	// 変換

	const phi = kai + delta1 * Math.sin(2.0 * kai)
					+ delta2 * Math.sin(4.0 * kai)
					+ delta3 * Math.sin(6.0 * kai);

	const lt_deg = 180.0 * phi / Math.PI;

	const lambda0 = Math.PI * LgBandToCM(utm.lg_band) / 180.0; 

	const lambda = lambda0 + Math.atan(Math.sinh(eta2) / Math.cos(ksi2));

	const lg_deg = 180.0 * lambda / Math.PI;

	//--------------------------------------------------

	return new CLgLt(lg_deg, lt_deg);
}
//---------------------------------------------------------------------------
function GetLgBand(lg){ return Math.floor(30.5 + (lg + 3.0) / 6.0);}
//---------------------------------------------------------------------------
function CMToLgBand(cm){ return Math.floor((cm + 183) / 6);}
//---------------------------------------------------------------------------
export function LgBandToCM(lg_band){ return lg_band * 6 - 183;}
//---------------------------------------------------------------------------
