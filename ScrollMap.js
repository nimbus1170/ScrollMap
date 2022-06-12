//
// ScrollMap.js
//
//---------------------------------------------------------------------------
import {CLgLt, ToDecimalDeg, GetDeg, GetMin, GetSec} from "./LgLt.js";
import {CUTM } from "./UTM.js"
import {ToUTM, ToLgLt} from "./Convert_LgLt_UTM.js"
import {MakeUTM, GetLtBand, GetMGRS_ID, GetMGRS_EW, GetMGRS_NS} from "./Convert_MGRS_UTM.js"
//---------------------------------------------------------------------------
const canvas = document.getElementById("canvas");

const context = canvas.getContext("2d");

const map_img = new Image();

	//--------------------------------------------------
	// 設定

	map_img.src = "./地図.jpg";

	const s_lg = ToDecimalDeg(130, 15, 0);
	const e_lg = ToDecimalDeg(130, 20, 0);
	const s_lt = ToDecimalDeg( 33, 32, 0);
	const e_lt = ToDecimalDeg( 33, 35, 0);

	canvas.width  = "2907";
	canvas.height = "2119";

	const font_size_px = 20;
	const font_family = "Arial Narrow";

	//--------------------------------------------------

context.font = font_size_px + "px " + font_family;
context.textAlign = "left";

const label = document.createElement("label");
document.body.appendChild(label);
label.style.font = context.font;
label.style.position = "absolute";
label.style.pointerEvents = "none";

let scroll_x = 0;
let scroll_y = 0;

let cl_w = document.body.clientWidth ;
let cl_h = document.body.clientHeight;

canvas.addEventListener("mousemove", (e) =>
{
	const ms_x = e.pageX - canvas.offsetLeft;
	const ms_y = e.pageY - canvas.offsetTop ;

	const ms_lglt = CanvasPosToLgLt(ms_x, ms_y);

	const ms_utm = ToUTM(ms_lglt);

	label.style.left = (e.pageX + 2) + "px";
	label.style.top  = (e.pageY - font_size_px * 2 - 8) + "px";

	label.innerText =
		GetDeg(ms_lglt.lg) + "d" + GetMin(ms_lglt.lg) + "m" + Math.trunc(GetSec(ms_lglt.lg)) + "s " +
		GetDeg(ms_lglt.lt) + "d" + GetMin(ms_lglt.lt) + "m" + Math.trunc(GetSec(ms_lglt.lt)) + "s\n" +
		ms_utm.lg_band + 
		GetLtBand(ms_lglt.lt) + " " +
		GetMGRS_ID(ms_utm) + " " + 
		("00000" + Math.trunc(GetMGRS_EW(ms_utm))).slice(-5) + " " +
		("00000" + Math.trunc(GetMGRS_NS(ms_utm))).slice(-5);
});

window.addEventListener("resize", () =>
{
	cl_w = document.body.clientWidth ;
	cl_h = document.body.clientHeight;

	redraw();
});

window.addEventListener("scroll", () =>
{
	scroll_x = window.pageXOffset;
	scroll_y = window.pageYOffset;

	redraw();
});

map_img.onload = () =>
{
	redraw();
}

function redraw()
{
	context.drawImage(map_img, 0, 0);

// テスト用
//#region
/*	// 左上隅
	const p_lglt = CanvasPosToLgLt(scroll_x, scroll_y);

	context.fillText
		(GetDeg(p_lglt.lg) + "d " +
		 GetMin(p_lglt.lg) + "m " +
		 Math.trunc(GetSec(p_lglt.lg)) + "s " +
		 GetDeg(p_lglt.lt) + "d " +
		 GetMin(p_lglt.lt) + "m " +
		 Math.trunc(GetSec(p_lglt.lt)) + "s",
		 scroll_x, font_size_px + 2 + scroll_y);

	const dst_utm = ToUTM(p_lglt);

	context.fillText
		(dst_utm.lg_band +
		 dst_utm.hemi + " " +
		 Math.trunc(dst_utm.ew) + " " +
		 Math.trunc(dst_utm.ns),
		 scroll_x, font_size_px * 2 + 2 + scroll_y);

	context.fillText
		(dst_utm.lg_band +
		 GetLtBand(p_lglt.lt) + " " +
		 GetMGRS_ID(dst_utm) + " " + 
		 ("00000" + Math.trunc(GetMGRS_EW(dst_utm))).slice(-5) + " " +
		 ("00000" + Math.trunc(GetMGRS_NS(dst_utm))).slice(-5),
		 scroll_x, font_size_px * 3 + 2 + scroll_y);

	context.beginPath(); 
	context.moveTo(scroll_x + 2, scroll_y + 2);
	context.lineTo(scroll_x + cl_w - (canvas.offsetLeft + 2), scroll_y + cl_h - (canvas.offsetTop + 2));
	context.stroke();
*/
//#endregion

	//--------------------------------------------------
	// 地図画像の端に経緯度グリッド座標(分)を標示する。

	context.fillStyle = 
	context.strokeStyle = "black";

	context.beginPath(); 

	let last_lg_min = GetMin(CanvasPosToLgLt(scroll_x, scroll_y).lg);

	for(let x = scroll_x; x <= scroll_x + cl_w - canvas.offsetLeft; ++x)
	{
		const p_lg = CanvasPosToLgLt(x, scroll_y).lg;

		const curr_lg_min = GetMin(p_lg);

		if(curr_lg_min == last_lg_min) continue;

		context.moveTo(x, scroll_y     );
		context.lineTo(x, scroll_y + 20);
	
		context.fillText
			(GetDeg(p_lg) + "°" + ("00" + GetMin(p_lg)).slice(-2) + "′",
			 x + 2, scroll_y + font_size_px);

		last_lg_min = curr_lg_min;
	}

	let last_lt_min = GetMin(CanvasPosToLgLt(scroll_x, scroll_y + cl_h - canvas.offsetTop).lg);

	for(let y = scroll_y + cl_h - canvas.offsetTop; y >= scroll_y; --y)
	{
		const p_lt = CanvasPosToLgLt(scroll_x, y).lt;

		const curr_lt_min = GetMin(p_lt);

		if(curr_lt_min == last_lt_min) continue;

		context.moveTo(scroll_x     , y);
		context.lineTo(scroll_x + 20, y);

		context.fillText
			(GetDeg(p_lt) + "°" + ("00" + GetMin(p_lt)).slice(-2) + "′",
			 scroll_x + 2, y + font_size_px);

		last_lt_min = curr_lt_min;
	}

	context.stroke();

	//--------------------------------------------------
	// 地図画像の端にUTMグリッド座標(km)を標示する。

	context.fillStyle = 
	context.strokeStyle = "maroon";

	context.beginPath(); 

	let last_utm_ew_km = Math.trunc(ToUTM(CanvasPosToLgLt(scroll_x, scroll_y)).ew / 1000);

	for(let x = scroll_x; x <= scroll_x + cl_w - canvas.offsetLeft; ++x)
	{
		const p_utm = ToUTM(CanvasPosToLgLt(x, scroll_y));

		// pxが1ずつ変化してもewが1(以下)づつ変化するとは限らない。
	//	if((Math.trunc(p_utm.ew) % 100) != 0) continue;

		const curr_utm_ew_km = Math.trunc(p_utm.ew / 1000);

		if(curr_utm_ew_km == last_utm_ew_km) continue;

		context.moveTo(x, scroll_y     );
		context.lineTo(x, scroll_y + 20);
	
		context.fillText
			(("00" + Math.trunc(p_utm.ew / 1000)).slice(-2),
			 x + 2, scroll_y + font_size_px);

		last_utm_ew_km = curr_utm_ew_km;
	}

	let last_utm_ns_km = Math.trunc(ToUTM(CanvasPosToLgLt(scroll_x, scroll_y + cl_h - canvas.offsetTop)).ns / 1000);

	for(let y = scroll_y + cl_h - canvas.offsetTop; y >= scroll_y; --y)
	{
		const p_utm = ToUTM(CanvasPosToLgLt(scroll_x, y));

		// pxが1ずつ変化してもnsが1(以下)づつ変化するとは限らない。
	//	if(Math.trunc(p_utm.ns % 1000) != 0) continue;

		const curr_utm_ns_km = Math.trunc(p_utm.ns / 1000);

		if(curr_utm_ns_km == last_utm_ns_km) continue;

		context.moveTo(scroll_x     , y);
		context.lineTo(scroll_x + 20, y);

		context.fillText
			(("00" + Math.trunc(p_utm.ns / 1000)).slice(-2),
			 scroll_x + 2, y + font_size_px);

		last_utm_ns_km = curr_utm_ns_km;
	}

	context.stroke();
}

function CanvasPosToLgLt(x, y)
{
	const lg = s_lg + (e_lg - s_lg) * (x / canvas.width );
	const lt = e_lt - (e_lt - s_lt) * (y / canvas.height);

	return new CLgLt(lg, lt);
}
//---------------------------------------------------------------------------
