import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtVerifier } from '@mancom/common';
import { JwtService } from '@mancom/jwt-utils';

@Injectable()
export class JwtVerifierService implements JwtVerifier {
    private readonly jwtService: JwtService;

    constructor(private readonly configService: ConfigService) {
        this.jwtService = new JwtService({
            privateKeyPath: '', // Not needed for verification
            publicKeyPath: this.configService.get<string>('jwt.publicKeyPath', ''),
        });
    }

    async verifyAccessToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAccessToken(token);
    }
}
