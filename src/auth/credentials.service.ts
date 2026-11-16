import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository.js';
import { PasswordHasher } from '@nestjs/authentication';
import { User } from '../user/types/user.type.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async verify(email: string, password: string): Promise<User | null> {
    const found = await this.userRepository.findCredentials(email);
    // With no account (or no password), verify() checks a dummy hash, so the
    // response time does not reveal which emails are registered.
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );
    if (!valid || !found?.passwordHash) {
      return null;
    }
    // The cost settings changed since this hash was stored: upgrade it now,
    // while we have the plaintext.
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.userRepository.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(password),
      );
    }
    return found.user;
  }
}
