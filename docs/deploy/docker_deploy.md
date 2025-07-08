## Desplegar con Docker

### Comandos utiles

**Build:** Construir la imagen

```
docker-compose -f docker-compose.production.yaml --env-file .env.production up --build
```

**Run:** Ejecutar la imagen

```
docker-compose -f docker-compose.production.yaml --env-file .env.production up -d
```


**IMPORTANTE:** Si se usa Prisma como ORM no olvidar agregar el script de arranque start.sh en el root del proyecto con el siguiente contenido

```sh

# ./start.sh

# Aplicar migraciones (modo producción)
npx prisma migrate deploy

# Iniciar la aplicación
node dist/main
```

/auth-microservice
├── Dockerfile
├── start.sh        ✅ ← debe existir aquí
├── src/
├── package.json
├── .env


**SOLUCION AL ERROR*:*  > [auth-microservice runner 9/9] RUN chmod +x start.sh:
0.643 chmod: start.sh: Operation not permitted
------
failed to solve: process "/bin/sh -c chmod +x start.sh" did not complete successfully: exit code: 1


chmod: start.sh: Operation not permitted

significa que Docker no tiene permiso para cambiar los permisos del archivo start.sh en la imagen final. Esto pasa comúnmente en imágenes basadas en node:alpine debido a restricciones del sistema de archivos o porque el archivo fue copiado como no editable por el usuario actual (por ejemplo, como root).


✅ Soluciones recomendadas

✅ Opción 1: Marca el archivo como ejecutable antes de construir la imagen

En tu máquina local (fuera de Docker):

```
chmod +x start.sh
```

Luego wuitar el comando RUN chmod +x start.sh en el Dockerfile y que quede asi:

COPY start.sh ./
CMD ["./start.sh"]
