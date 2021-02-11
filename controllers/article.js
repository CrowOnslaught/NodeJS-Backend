'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');
var controller = 
    {
        datosCurso: (req, res) => 
        {
            var hola = req.body.hola;
            return res.status(200).send(
                {
                    curso: 'Master en Frameworks JS',
                    autor: 'Victor Robles Web',
                    url: 'victorroblesweb.es',
                    hola
                });
        },
        test: (req, res) =>
        {
            var params = req.body;
            console.log(params);
            return res.status(200).send(
                {
                    message: 'Soy la acción TEST de mi controlador de artículos.'
                });
        },

        save: (req, res) =>
        {
            // Recoger los parámetros por POST
            var params = req.body;

            //Validar datos (validator)
            try
            {
                var validateTitle = !validator.isEmpty(params.title);
                var validateContent = !validator.isEmpty(params.content);
            }
            catch(err)
            {
                return res.status(200).send(
                    {
                        status: 'error',
                        message: 'faltan datos por enviar'
                    });
            }

            if(validateTitle && validateContent)
            {
                //Crear el objeto a guardar
                var article = new Article();

                //Asignar valores al objeto
                article.title = params.title;
                article.content = params.content;
                article.image = null;

                //Guardar el artículo
                article.save((err, articleStored)=>
                {
                    if(err || !articleStored)
                    {
                        return res.status(404).send(
                            {
                                status: 'error',
                                message: 'El articulo no se ha guardado'
                            });
                    }   
                    //Devolver una respuesta
                    return res.status(200).send(
                        {
                            status: 'success',
                            article: articleStored
                        });
                });
    
            }
            else
            {
                return res.status(200).send(
                    {
                        status: 'error',
                        message: 'Los datos no son válidos'
                    });
            }
        },

        getArticles: (req, res) => 
        {
            var query =  Article.find({});

            var last = req.params.last;
            if(last || last != undefined)
            {
                query.limit(5);
            }

            //Find todos los artículos en orden inverso (de más nuevo a más viejo)
            query.sort('-_id').exec((err, articles) => 
            {

                if(err)
                {
                    return res.status(500).send(
                        {
                            status: 'error',
                            message: 'Error al devolver los artículos'
                        });
                }
                if(!articles)
                {
                    return res.status(404).send(
                        {
                            status: 'error',
                            message: 'No hay artículos para mostrar'
                        });
                }

                return res.status(200).send(
                    {
                        status: 'sucess',
                        articles
                    });
            });
        },

        getArticle: (req, res) =>
        {
            //Recoger el id de la url
            var articleID = req.params.id;

            //comprobar que existe
            if(!articleID || articleID == null)
            {
                return res.status(404).send(
                    {
                        status: 'error',
                        message: 'No existe el artículo'
                    });
            }
            //Buscar el artículo
            Article.findById(articleID, (err, article)=>
                {
                    if(!article || err)
                    {
                        return res.status(404).send(
                            {
                                status: 'error',
                                message: 'No existe el artículo'
                            });
                    }

                    //Devolverlo en json
                    return res.status(500).send(
                        {
                            status: 'success',
                            article
                        });
                });
        },
        update : (req, res) =>
        {
            //Recoger el id del artículo por la url
            var articleID = req.params.id;

            //Recoger los datos que llegan por put
            var params = req.body;

            //Validar datos
            try
            {
                var validateTitle = !validator.isEmpty(params.title);
                var validateContent = !validator.isEmpty(params.content);
            }
            catch(err)
            {
                return res.status(500).send(
                    {
                        status: 'error',
                        message: 'Faltan datos por enviar'
                    });
            }

            if(validateTitle && validateContent)
            {
                //Find and update
                Article.findByIdAndUpdate({_id:articleID}, params, {new:true}, (err, articleUpdated) =>
                {
                    if(err || !articleUpdated)
                    {
                        return res.status(404).send(
                            {
                                status: 'error',
                                message: 'No existe el artículo'
                            });
                    }

                    //Devolver la respuesta
                    return res.status(200).send(
                        {
                            status: 'succes',
                            article: articleUpdated
                        });
                });
            }else
            {
                return res.status(500).send(
                    {
                        status: 'error',
                        message: 'Faltan datos'
                    });
            }
        },

        delete: (req, res) =>
        {
            //Recoger el id de la url
            var articleID = req.params.id;

            //Find and delete
            Article.findOneAndDelete({_id:articleID}, (err, articleRemoved) =>
                {
                    if(err || !articleRemoved)
                    {
                        return res.status(500).send(
                            {
                                status: 'error',
                                message: 'article not found'
                            });
                    }

                    return res.status(200).send(
                        {
                            status: 'success',
                            article: articleRemoved
                        });
                });

        },

        upload: (req,res) =>
        {
            //Configurar el modulo connect multiparty router/article.js (DONE)

            //Recoger el fichero de la petición
            var fileName = 'Image not upload';

            if(!req.files)
            {
                return res.status(404).send(
                    {
                        status: 'error',
                        message: fileName
                    });
            }

            //Conseguir el nombre y la extensión
            var filePath = req.files.file0.path;
            var fileSplit = filePath.split('\\');
            fileName = fileSplit[2];
            var fileExt = fileName.split('.')[1];

            //Comprobar la extensión (solo imagenes)
            if(fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif')
            {
                //Borrar el archivo subido
                fs.unlink(filePath, (err) => 
                    {
                        return res.status(500).send(
                            {
                                status: 'error',
                                message:'La extensión de la imagen no es válida'
                            });
                    })
            }
            else
            {
                //Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                var articleID = req.params.id;
                Article.findOneAndUpdate({_id:articleID}, {image: fileName}, {new:true}, (err, articleUpdated) => 
                    {
                        if (err || !articleUpdated)
                        {
                            return res.status(200).send(
                                {
                                    status: 'error',
                                    message: 'Error al guardar la imagen de artículo'
                                });
                        }


                        return res.status(200).send(
                            {
                                status: 'success',
                                articleUpdated
                            });
                    });

            }
        },

        getImage: (req, res) =>
        {
            var file = req.params.image;
            var pathFile = './upload/articles/'+file;
            fs.exists(pathFile, (exists) =>
            {
                if(exists)
                {
                    return res.sendFile(path.resolve(pathFile));
                }
                else
                {

                    return res.status(404).send(
                        {
                            status: 'error',
                            message: 'La imagen no existe'
                        });
                }
            });
        },
        search: (req, res) =>
        {
            //Sacar el string a buscar de la url
            var searchString = req.params.search;

            //Find or
            Article.find({ "$or": [
                {'title': {'$regex': searchString, '$options': 'i'}},
                {'content': {'$regex': searchString, '$options': 'i'}}
            ]})
            .sort([['date', 'descending']])
            .exec((err, articles) =>
                {
                    if (err)
                    {
                        return res.status(500).send(
                            {
                                status: 'error',
                                message: 'Error en la petición',
                            });
                    }
                    if(!articles || articles.length == 0)
                    {
                        return res.status(404).send(
                            {
                                status: 'error',
                                message: 'No hay artículos que coincidan con tu búsqueda',
                            });
                    }

                    return res.status(200).send(
                        {
                            status: 'success',
                            articles
                        });
                });
        }
    }// end controller

module.exports = controller;