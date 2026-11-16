import {
  AuthenticationRegistry,
  SessionCookieProvider,
  SessionRecord,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { User } from '../user/types/user.type.js';
import { UserRepository } from '../user/repositories/user.repository.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
  constructor(
    private readonly userRepository: UserRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  // Called for every Request with a live session cookie.
  // Returning null ends the session
  validate(session: SessionRecord) {
    return this.userRepository.findById(session.userId);
  }
}
