//
// UTM.hpp
// UTM座標
//
//---------------------------------------------------------------------------
export class CUTM
{
	constructor(hemi, lg_band, ew, ns){
		if((typeof hemi) === "string")
			Object.assign(this, {hemi, lg_band, ew, ns});
		else if(hemi instanceof CUTM)
			Object.assign(this, hemi);
	}

	clone(){ return new CUTM(this);}
}
//---------------------------------------------------------------------------
