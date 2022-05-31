const gulp = require('gulp')
const minify = require('gulp-minify');
const replace = require('gulp-string-replace');
const ts = require('gulp-typescript');
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const rollup = require('rollup')
const fs = require("fs");
const tsProject = ts.createProject('tsconfig.json', { declaration: true, "removeComments": true });


const onwarn = warning => {
    // Silence circular dependency warning for moment package
    if (warning.code === 'CIRCULAR_DEPENDENCY')
        return

    console.warn(`(!) ${warning.message}`)
}

let first = true;
//生成 js文件, 需要有命名空间的类写法,打包库文件，无需入口文件
gulp.task('buildJs', () => {
    return tsProject.src().pipe(tsProject())
        .pipe(replace('var long;', function () {//替换第一行文本
            if (first) {
                first = false;
                return "window.long = {};";
            }
            else
                return "";
        }, { logs: { enabled: false } }))
        .pipe(gulp.dest('./dist/long/'));
})

// gulp.task("buildDts", () => {
//     return tsProject.src()
//         .pipe(tsProject())
//         .dts.pipe(gulp.dest('./build/'))
// });

gulp.task('buildDts', () => {
    return gulp
        .src(['./scripts/long/**/*.ts'])//, './!(node_modules)/*.ts', './!(src)/*.ts'
        .pipe(ts({
            // 这里对应参数 
            // { "declaration": true }
            // /* Generates corresponding '.d.ts' file. */
            "declaration": true,
            "removeComments": true
        }))
        .pipe(gulp.dest('./build/long/'))
});

//打包所有 d.ts文件 ,在jsmin任务执行完后执行
// gulp.task('concatAllTs', function () {
//     gulp.src('build/long/**/*.d.ts')
//         .pipe(concat('long.d.ts')) //合并之后的文件名
//         .pipe(gulp.dest('dist/long/')) //合并之后保存的路径
// });

//运行文件时，有入口时使用，一般编译文件时使用次,
gulp.task("rollup", async function () {
    let config = {
        // input: "build/Long.js",
        input: "src/Main.ts",
        external: ['Laya', "fgui"],
        onwarn: onwarn,
        output: {
            file: 'bin/bundle.js',//运行文件
            format: 'umd',
            extend: true,
            name: 'long'
        }
    };
    const subTask = await rollup.rollup(config);
    await subTask.write(config);
});

//压缩混淆并生成min.js
gulp.task("uglify", function () {
    return gulp.src("dist/long/long.js")
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify({
            mangle: {
                keep_fnames: true
            }
        }))
        .pipe(gulp.dest("dist/long/"));
});


gulp.task('build'
    , gulp.series(
        gulp.parallel('buildJs'),
        gulp.parallel('uglify'),
        gulp.parallel('buildDts'),
        // gulp.parallel("concatAllTs")
        // gulp.parallel('rollup'),

    )
)