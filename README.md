# PureScript-Helper
This project contain compiler and remove warning files.


For Warning Remover

1. Copy paste the purescript-janitor.js in your project.
2. Update Package.json
  Add script as
      
      "janitor": "node purescript-janitor.js",
      
      "build": "pulp build"
3. Run in terminal - 
    
        npm run janitor


To use Compiler

 1. run this command in terminal
 
        ./purs compile 'bower_components/purescript-*/src/**/*.purs' 'src/**/*.purs' --watchSrc 
