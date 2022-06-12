//
// LgLt.js
// 経緯度座標
//
//---------------------------------------------------------------------------
export class CLgLt
{
	constructor(lg, lt){
		if(((typeof lg) === "number") && ((typeof lt) === "number"))
			Object.assign(this, {lg, lt});
		else if(lg instanceof CLgLt)
			Object.assign(this, lg);
	}

	clone(){ return new CLgLt(this);}
}
//---------------------------------------------------------------------------
export function ToDecimalDeg(deg, min, sec)
{
	// 秒の繰り下がり・繰り上がり
    while(sec >= 60){ ++min; sec -= 60;}
    while(sec <   0){ --min; sec += 60;}

	// 分の繰り下がり・繰り上がり
    while(min >= 60){ ++deg; min -= 60;}
    while(min <   0){ --deg; min += 60;}

	return deg + min / 60.0 + sec / 3600.0;
}
//---------------------------------------------------------------------------
// ◆分・秒は誤差は大丈夫か？
export function GetDeg(decimal_deg){ return Math.trunc( decimal_deg									 				);}
export function GetMin(decimal_deg){ return Math.trunc((decimal_deg 		- Math.trunc(decimal_deg	   )) * 60.0);}
export function GetSec(decimal_deg){ return			  ((decimal_deg * 60.0) - Math.trunc(decimal_deg * 60.0)) * 60.0 ;}
//---------------------------------------------------------------------------
