//importa dependencias necesarias para la compilacion de sass
import path from "path"
import fs from "fs"
import {glob} from "glob"
import gulpSass from 'gulp-sass' 
import {src, dest, watch, series} from 'gulp'
import * as dartSass from 'sass'

//Inicializa el compilador sass usando dartsass como implementación
const sass = gulpSass(dartSass)

//esta funcion compila el archivo principal de SCSS a CSS
//Toma una ruta como entrada, lo procesa con sass y almacena el css resultante en build/css
export function css (done) {

    src('src/scss/app.scss', {sourcemaps: true}) //los pipes controlan el orden de ejecucion de las funciones
        .pipe(sass({style: 'compressed'}).on('error',sass.logError)) //aplica sass
        .pipe(dest('build/css', {sourcemaps: "."}))

    done() //callback que señala el término de la tarea
}


import terser from 'gulp-terser';
import sharp from 'sharp';

//redimensona imagenes para hacerlas mas ligeras
export async function crop(done) {
    const inputFolder = 'img/gallery/full' //carpeta de imagenes originales
    const outputFolder = 'img/gallery/thumb'; //carpeta de salida (forma de miniaturas)
    const width = 250;
    const height = 180; //tamaño destino de pixeles
    if (!fs.existsSync(outputFolder)) { //crea carpeta de salida si es que no existe
        fs.mkdirSync(outputFolder, { recursive: true })
    }
    //filtra solo archivos .jpg de la carpeta de entrada
    const images = fs.readdirSync(inputFolder).filter(file => {
        return /\.(jpg)$/i.test(path.extname(file));
    });
    try {
        images.forEach(file => {
            const inputFile = path.join(inputFolder, file)
            const outputFile = path.join(outputFolder, file)
            sharp(inputFile)  //redimensiona cada imagen al widht y height definidos al anteriormente y centra el recorte
                .resize(width, height, {
                    position: 'centre'
                })
                .toFile(outputFile)
        });

        done() //indica que la tarea ha terminado
    } catch (error) {
        console.log(error)
    }
}


export async function imagenes(done) {
    const srcDir = 'img';
    const buildDir = 'build/img';
    const images =  await glob('img/**/*{jpg,png}')

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

//convierte imagenes a webp
function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)
    const outputFile = path.join(outputSubDir, `${baseName}${extName}`)
    const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`)
    const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`)

    const options = { quality: 80 }
    sharp(file).jpeg(options).toFile(outputFile)
    sharp(file).webp(options).toFile(outputFileWebp)
    sharp(file).avif().toFile(outputFileAvif)
}

export function js (done){

    src("src/js/app.js")
        .pipe(terser())
        .pipe(dest("build/js"))

    done()
}

//funcion para observar cambios sobre el archivo scss y recompilar de manera automatizada
//para posteriormente volver a quedar en escucha de cambios en el fichero
export function dev() {
    watch('src/scss/**/*.scss', css) //ubica el archivo y ejecuta la funcion css sobre ese archivo
    watch('src/js/**/*.js', js) //ubica el archivo y ejecuta la funcion js sobre ese archivo
    watch('img/**/*.{png,jpg}', imagenes) //ubica las imagenes y ejecuta la funcion imagenes para convertirlas a formto webp
    
}

export default series(crop, js, css, imagenes, dev)