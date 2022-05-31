const gulp = require('gulp')
const minify = require('gulp-minify');
const replace = require('gulp-string-replace');
const ts = require('gulp-typescript');
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const rollup = require('rollup')
const tsProject = ts.createProject('tsconfig.json', { declaration: true, "removeComments": true });

const onwarn = warning => {
    // Silence circular dependency warning for moment package
    if (warning.code === 'CIRCULAR_DEPENDENCY')
        return

    console.warn(`(!) ${warning.message}`)
}

// gulp.task('buildJs', () => {
//     return tsProject.src()
//         .pipe(tsProject())
//         .js.pipe(replace('var long;', function () {
//             if (first) {
//                 first = false;
//                 return "window.long = {};";
//             }
//             else
//                 return "";
//         }, { logs: { enabled: false } }))
//         .pipe(minify({ ext: { min: ".min.js" } }))
//         .pipe(gulp.dest('./dist/libs/long/'));
// })
// let first = true;
// //需要有命名空间的类写法,打包库文件，无需入口文件
// gulp.task('buildJs', () => {
//     return tsProject.src().pipe(tsProject())
//         .pipe(replace('var long;', function () {//替换第一行文本
//             if (first) {
//                 first = false;
//                 return "window.long = {};";
//             }
//             else
//                 return "";
//         }, { logs: { enabled: false } }))
//         .pipe(gulp.dest('./dist'));
// })

// gulp.task("buildDts", () => {
//     return tsProject.src()
//         .pipe(tsProject())
//         .dts.pipe(gulp.dest('./build/libs/long/'))
// });

// gulp.task('buildDts', () => {
//     return gulp
//         .src(['./scripts/long/**/*.ts'])//, './!(node_modules)/*.ts', './!(src)/*.ts'
//         .pipe(ts({
//             // 这里对应参数 
//             // { "declaration": true }
//             // /* Generates corresponding '.d.ts' file. */
//             "declaration": true,
//             "removeComments": true
//         }))
//         .pipe(gulp.dest('./build/libs/long/'))
// });

// //建立一个名为testConcat的任务,在jsmin任务执行完后执行
// gulp.task('concatAllTs', function () {
//     gulp.src('build/libs/long/**/*.d.ts')
//         .pipe(concat('long.d.ts')) //合并之后的文件名
//         .pipe(gulp.dest('dist/')) //合并之后保存的路径
// });

//拷贝最新的的js库文件
gulp.task('copyJs', () => {
    return gulp
        .src(['../dist/long/long.js', '../dist/long/long.min.js'])
        .pipe(gulp.dest('./bin/libs/'))
});

//拷贝最新的的d.ts文件
gulp.task('copyDts', () => {
    return gulp
        .src(['../dist/long/long.d.ts'])
        .pipe(gulp.dest('./libs/'))
});

//编译JS或者TS文件 ，生成运行文件，有入口时使用，一般编译文件时使用此
gulp.task("rollup", async function () {
    let config = {
        // input: "build/Long.js",
        input: "src/Main.ts",
        onwarn: onwarn,
        output: {
            file: 'bin/js/bundle.js',//生成运行文件
            format: 'umd',
            extend: true,
            name: 'long'
        }
    };
    const subTask = await rollup.rollup(config);
    await subTask.write(config);
});

gulp.task("uglify", function () {
    return gulp.src("dist/long.js")
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify(/* options */))
        .pipe(gulp.dest("dist/"));
});

gulp.task('compile',
    gulp.series(
        gulp.parallel('copyJs'),
        gulp.parallel('copyDts'),
        // gulp.parallel('uglify'),
        // gulp.parallel('buildDts'),
        // gulp.parallel("concatAllTs")       
        gulp.parallel('rollup')
    )
);