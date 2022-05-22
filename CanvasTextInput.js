//
//
//
window.onload = () =>
{
	const canvas = document.getElementById("canvas");

	const context = canvas.getContext("2d");

	context.font = "16px courier";
	context.textAlign = "left";

	const textarea = document.createElement("textarea");
	document.body.appendChild(textarea);
	textarea.style.position = "absolute";

	let textarea_visibility_bup = textarea.style.visibility;
	textarea.style.visibility = "hidden";

	let ms_x, ms_y;

	canvas.addEventListener("click", (e) =>
	{
		ms_x = e.pageX - canvas.offsetLeft;
		ms_y = e.pageY - canvas.offsetTop;

		textarea.style.left = e.pageX + "px";
		textarea.style.top  = e.pageY + "px";

		textarea.style.visibility = textarea_visibility_bup;

		textarea.focus();
	});

	canvas.addEventListener("keypress", (e) =>
	{
		// ◆反応しない。
		textarea.value = "ok";
	});

	textarea.addEventListener("keypress", (e) =>
	{
		if(e.code == "Enter")
		{
			if(textarea.value == "") return;
		
			context.strokeText(textarea.value, ms_x, ms_y);

			textarea.value = "";
			textarea_visibility_bup = textarea.style.visibility;
			textarea.style.visibility = "hidden";
		};
	});
}