const memories = await JSON.parse(
	await Deno.readTextFile("./gdpr/memories.json"),
);

for (const memory of memories) {
	const frontImage = memory.frontImage.path.replace(
		/.*\//,
		"./export/frontImages/",
	);
	const backImage = memory.backImage.path.replace(
		/.*\//,
		"./export/backImages/",
	);

	const frontImagePath = memory.frontImage.path.replace(
		/.*\//,
		"./gdpr/Photos/post/",
	);
	//await Deno.rename(frontImagePath, frontImage);

	const backImagePath = memory.backImage.path.replace(
		/.*\//,
		"./gdpr/Photos/post/",
	);
	//await Deno.rename(backImagePath, backImage);
	const timestamp = memory.takenTime.replace(
		/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
		"$1:$2:$3 $4:$5:$6",
	);

	await setExif(frontImage, "Exif.Photo.DateTimeOriginal", timestamp);
	await setExif(frontImage, "Exif.Image.DateTime", timestamp);

	await setExif(
		frontImage,
		"Exif.GPSInfo.GPSLatitude",
		ConvertDDToDMS(memory.location.latitude, false).dms,
	);
	await setExif(
		frontImage,
		"Exif.GPSInfo.GPSLatitudeRef",
		ConvertDDToDMS(memory.location.latitude, false).dir,
	);
	await setExif(
		frontImage,
		"Exif.GPSInfo.GPSLongitude",
		ConvertDDToDMS(memory.location.longitude, true).dms,
	);
	await setExif(
		frontImage,
		"Exif.GPSInfo.GPSLongitudeRef",
		ConvertDDToDMS(memory.location.longitude, true).dir,
	);
	break;
}

async function setExif(path: string, key: string, value: string) {
	await new Deno.Command("exiv2", {
		args: [
			"-M",
			`set ${key} ${value}`,
			path,
		],
	}).spawn().status;
}

function ConvertDDToDMS(D: number, lng: boolean) {
	return {
		dir: D < 0 ? (lng ? "W" : "S") : lng ? "E" : "N",
		dms: String(0 | (D < 0 ? (D = -D) : D)) + "/1 " +
			String(0 | (((D += 1e-9) % 1) * 60)) + "/1 " +
			String(0 | (((D * 60) % 1) * 6000)) + "/100",
	};
}
