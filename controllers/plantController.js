const Plant = require("../models/plant");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

const async = require("async");

exports.index = (req, res, next) => {
  async.parallel(
    {
      plant_count(callback) {
        Plant.countDocuments({}, callback);   
      },      
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
      category_display(callback) {
        Category.find({}, "name")
        .sort({ name: 1 })
        .exec(callback)
      }      
    },
    (err, results) => {
      res.render("index", {
        title: "Houseplants for Your House",
        error: err,
        data: results
      });
    }
  );
};

// Display list of all plants.
exports.plant_list = function (req, res, next) {
  Plant.find({}, "image name price")
    .sort({ name: 1 })
    .exec(function (err, list_plants) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("plant_list", { title: "Our Houseplants", plant_list: list_plants });
    });
};


// Display detail page for a specific plant.
exports.plant_detail = (req, res, next) => {
  Plant.findById(req.params.id)
    .populate("category")
    .exec((err, plant) => {
      if (err) {
        return next(err);
      }
      if (plant == null) {
        // No results.
        const err = new Error("Plant not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("plant_detail", {
        title: plant.name,
        plant,
      });
    });  
};

// Display plant create form on GET.
exports.plant_create_get = (req, res, next) => {
  // Get all categories
  Category.find({}, "name").exec((err, categories) => {
    if (err) {
      return next(err);
    }

    // Successful, so render
    res.render("plant_form", {
      title: "Create Plant",
      categories: categories,
    })
  })
};

// Handle plant create on POST.
exports.plant_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name is required.")
    .exists()
    .trim()
    .escape(),
  body("description", "Description is required.")
    .exists()
    .trim()
    .escape(),
  body("price", "Price is required.")
    .exists()
    .isNumeric()
    .escape(),
  body("stock", "Stock must be an integer number.")
    .exists()
    .trim()
    .isInt()
    .escape(),
  // body("image", "Image must not be empty.")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a plant object with escaped and trimmed data.
    const plant = new Plant({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      // image: req.body.image,

      image: req.file.path.slice(6),

      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      Category.find({}, "name").exec((err, categories => {
        if (err) {
          return next(err);
        }

        // Mark selected categories as checked.
        for (const category of categories) {
          if (plant.category.includes(category._id)) {
            category.checked = "true";
          }
        }

        // Successful, so render
        res.render("plant_form", {
            title: "Create Plant",
            categories,
            plant,
            errors: errors.array(),
          });
      }))        
      return;
    }

    // Data from form is valid. Save plant.
    plant.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new plant record.
      res.redirect(plant.url);
    });
  },
];

// Display plant delete form on GET.
exports.plant_delete_get = (req, res, next) => {
  Plant.findById(req.params.id).exec((err, plant) => {
    if (err) {
      return next(err);
    }
    if (plant == null) {
      // No results.
      res.redirect("/catalog/plants");
    }

    // Successful, so render
    res.render("plant_delete", {
      title: "Delete Plant",
      plant,
    })
  })  
};

// Handle plant delete on POST.
exports.plant_delete_post = (req, res, next) => {
  Plant.findById(req.body.plantid).exec((err, plant) => {
    if (err) {
      return next(err);
    }
    // Success    
    Plant.findByIdAndRemove(req.body.plantid, (err) => {
      if (err) {
        return next(err);
      }
      // Success - go to plant list
      res.redirect("/catalog/plants");
    });
  }
  );
};

// Display plant update form on GET.
exports.plant_update_get = (req, res, next) => {
  async.parallel(
  {
    plant(callback) {
      Plant.findById(req.params.id)
        .populate("category")
        .exec(callback);
    },
    categories(callback) {
      Category.find(callback);
    }
  },
  (err, results) => {
    if (err) {
      return next(err)
    }
    if (results.plant == null) {
      // No results
      const err = new Error("Plant not found");
      err.status = 404;
      return next(err);
    }
    // Success
    // Mark selected categories as checked.
    for (const category of results.categories) {
      for (const plantCategory of results.plant.category) {
        if (category._id.toString() === plantCategory._id.toString()) {
          category.checked = "true"
        }
      }
    }
    res.render("plant_form", {
      title: "Update Plant",
      categories: results.categories,
      plant: results.plant,
    })
  }  
  );
};

// Handle plant update on POST.
exports.plant_update_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name is required.")
    .exists()
    .trim()
    .escape(),
  body("description", "Description is required.")
    .exists()
    .trim()
    .escape(),
  body("price", "Price is required.")
    .exists()
    .isNumeric()
    .escape(),
  body("stock", "Stock must be an integer number.")
    .exists()
    .trim()
    .isInt()
    .escape(),
  // body("image", "Image must not be empty.")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a plant object with escaped and trimmed data.
    const plant = new Plant({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      // image: req.body.image,

      image: req.file.path.slice(6),


      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.    
      Category.find({}, "name").exec((err, categories => {
        if (err) {
          return next(err);
        }

        // Mark selected categories as checked.
        for (const category of categories) {
          if (plant.category.includes(category._id)) {
            category.checked = "true";
          }
        }

        // Successful, so render
        res.render("plant_form", {
            title: "Update Plant",
            categories,
            plant,
            errors: errors.array(),
          });
      }))        
      return;
    }

    // Data from form is valid. Update plant.
    Plant.findByIdAndUpdate(req.params.id, plant, {}, (err, theplant) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to new plant record.
      res.redirect(theplant.url);
    });    
  },
];
