//importa dependencias necesarias para la compilacion de sass
import gulpSass from 'gulp-sass' 
import {src, dest, watch} from 'gulp'
import * as dartSass from 'sass'

//Inicializa el compilador sass usando dartsass como implementación
const sass = gulpSass(dartSass)

//esta funcion compila el archivo principal de SCSS a CSS
//Toma una ruta como entrada, lo procesa con sass y almacena el css resultante en build/css
export function css (done) {

    src('src/scss/app.scss') //los pipes controlan el orden de ejecucion de las funciones
        .pipe(sass()) //aplica sass
        .pipe(dest('build/css'))

    done() //callback que señala el término de la tarea
}

//funcion para observar cambios sobre el archivo scss y recompilar de manera automatizada
//para posteriormente volver a quedar en escucha de cambios en el fichero
export function dev() {
    watch('src/scss/app.scss', css) //ubica el archivo y ejecuta la funcion css sobre ese archivo
    
}