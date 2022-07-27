export const DEPENDENCIES: Record<string, string> = {
    "@nestjs/platform-fastify": "^8.4.4",
    "@vendia/serverless-express": "^4.8.0",
    "aws-lambda": "^1.0.7",
    "aws-lambda-fastify": "^2.1.2",
};

export const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/aws-lambda": "^8.10.95",
    "@types/express": "^4.17.13",
    "@types/serverless": "^3.12.7",
    "serverless": "^3.21.0",
    "serverless-offline": "^9.0.0",
    "serverless-plugin-optimize": "^4.2.1-rc.1",
    "serverless-plugin-typescript": "^2.1.2"
};
