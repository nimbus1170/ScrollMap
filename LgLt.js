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
