import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CorrId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        // TODO: mit middleware implementieren
        return Math.floor(Math.random() * 100000);
    },
);