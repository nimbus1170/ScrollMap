//
// Convert_LgLt_UTM_test.js
//
//---------------------------------------------------------------------------
import {CLgLt} from "./LgLt.js";
import {CUTM } from "./UTM.js"
import {ToUTM, ToLgLt} from "./Convert_LgLt_UTM.js"
import {MakeUTM, GetLtBand, GetMGRS_ID, GetMGRS_EW, GetMGRS_NS} from "./Convert_MGRS_UTM.js"
//---------------------------------------------------------------------------
const canvas = document.getElementById("canvas");

const context = canvas.getContext("2d");

const font_size_px = 20;

context.font = font_size_px + "px Arial Narrow";
context.textAlign = "left";

// (130.1583, 33.5750) -> (52S, 607502, 3715635)
// ◆MapViewer_testとかと微妙にずれる。

const src_lglt = new CLgLt(130.1583, 33.5750);

const dst_utm = ToUTM(src_lglt);

context.fillText
	(dst_utm.lg_band +
	 dst_utm.hemi + " " +
	 Math.floor(dst_utm.ew) + " " +
	 Math.floor(dst_utm.ns),
	 0, font_size_px);

	 context.fillText
	 (dst_utm.lg_band +
	  GetLtBand(src_lglt.lt) + " " +
	  GetMGRS_ID(dst_utm) + " " + 
	  ("00000" + Math.floor(GetMGRS_EW(dst_utm))).slice(-5) + " " +  // ◆toFixedは四捨五入するので切り捨てには使えないので注意
	  ("00000" + Math.floor(GetMGRS_NS(dst_utm))).slice(-5),
	  0, font_size_px * 2 + 2);
 
const dst_lglt = ToLgLt(dst_utm);

context.fillText
	(dst_lglt.lg.toFixed(4) + " " +
	 dst_lglt.lt.toFixed(4),
	 0, font_size_px * 3 + 2);

const dst_utm_2 = MakeUTM(52, "S", "FC", 7499, 15635);

context.fillText
	(dst_utm_2.lg_band +
	 GetLtBand(src_lglt.lt) + " " +
	 GetMGRS_ID(dst_utm_2) + " " + 
	 ("00000" + Math.floor(GetMGRS_EW(dst_utm_2))).slice(-5) + " " +
	 ("00000" + Math.floor(GetMGRS_NS(dst_utm_2))).slice(-5),
	 0, font_size_px * 4 + 2);

//---------------------------------------------------------------------------
