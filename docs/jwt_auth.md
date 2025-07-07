### JWT AUTENTICACION

docs: https://docs.nestjs.com/security/authentication#jwt-token



1. Instalar paquete

```bash
npm install --save @nestjs/jwt
```

2. Agregar JWT_SECRET en .env

3. Agregar y validar JWT_SECRET en ./config/envs.ts

4. Configurar auth.module, agregar en imports

```ts
JwtModule.register({
  global: true,
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '60s' },
}),
```
**Generar jwt**

1. Inyectar JwtService en el controlador que auth.controller

2. Crear interfaz con los datos que se van a firmar

2. Generar token usando el metodo sign

```ts

export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}

```