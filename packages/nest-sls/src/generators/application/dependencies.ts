export const DEPENDENCIES: Record<string, string> = {
    "@nestjs/platform-fastify": "^7.0.0",
    "@vendia/serverless-express": "^4.3.0",
    "aws-lambda": "^1.0.6",
    "aws-lambda-fastify": "^1.4.4",
};

export const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/aws-lambda": "^8.10.72",
    "@types/express": "^4.17.8",
    "serverless": "^2.23.0",
    "serverless-offline": "^6.8.0",
    "serverless-plugin-optimize": "^4.1.4-rc.1",
    "serverless-plugin-typescript": "^1.1.9",
};
