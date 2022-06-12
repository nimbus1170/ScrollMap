//
// UTM.js
// UTM座標
//
//---------------------------------------------------------------------------
export class CUTM
{
	constructor(lg_band, hemi, ew, ns){
		if((typeof lg_band) === "number")
			Object.assign(this, {lg_band, hemi, ew, ns});
		else if(lg_band instanceof CUTM)
			Object.assign(this, hemi);
	}

	clone(){ return new CUTM(this);}
}
//---------------------------------------------------------------------------
