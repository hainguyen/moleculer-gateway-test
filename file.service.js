const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "__uploads");

module.exports = {
	name: "file",
	actions: {
		save: {
			handler(ctx) {
				return new this.Promise((resolve, reject) => {
					reject(new Error("example error"));
					const filePath = path.join(uploadDir, ctx.meta.filename || this.randomName());
					const f = fs.createWriteStream(filePath);
					f.on("close", () => {
						this.logger.info(`Uploaded file stored in '${filePath}'`);
						resolve({ filePath, meta: ctx.meta });
					});
					f.on("error", err => reject(err));

					ctx.params.pipe(f);
				});
			}
		}
	},
	methods: {
		randomName() {
			return "unnamed_" + Date.now() + ".png";
		}
	}
};
