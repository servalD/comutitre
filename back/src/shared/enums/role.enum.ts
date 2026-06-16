/**
 * Application-managed roles (RBAC). These live in our own database, NOT in the
 * identity providers (Dynamic.xyz / FranceConnect) which only authenticate users.
 */
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
