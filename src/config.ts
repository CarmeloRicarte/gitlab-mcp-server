import { z } from "zod";

const envSchema = z.object({
	GITLAB_HOST: z.string().url().default("https://gitlab.com"),
	GITLAB_TOKEN: z.string().min(1, "GITLAB_TOKEN is required"),
});

function loadConfig() {
	const result = envSchema.safeParse({
		GITLAB_HOST: process.env.GITLAB_HOST,
		GITLAB_TOKEN: process.env.GITLAB_TOKEN,
	});

	if (!result.success) {
		const errors = result.error.issues
			.map((e) => `  - ${String(e.path.join("."))}: ${e.message}`)
			.join("\n");
		console.error(`Configuration error:\n${errors}`);
		process.exit(1);
	}

	return {
		gitlabHost: result.data.GITLAB_HOST,
		gitlabToken: result.data.GITLAB_TOKEN,
		apiBase: `${result.data.GITLAB_HOST}/api/v4`,
	};
}

export type Config = ReturnType<typeof loadConfig>;

export const config = loadConfig();
