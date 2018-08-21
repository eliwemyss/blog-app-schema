const express = require("express");
const router = express.Router();

const { Author, BlogPost } = require("./models");

router.get('/authors', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => {
        return {
          id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


router.post('/authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Author
    .findOne({ userName: req.body.userName })
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(author => res.status(201).json({
              _id: author.id,
              name: `${author.firstName} ${author.lastName}`,
              userName: author.userName
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});


router.put('/authors/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Author
    .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
    .then(author => {
      if(author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updatedAuthor => {
            res.status(200).json({
              id: updatedAuthor.id,
              name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
              userName: updatedAuthor.userName
            });
          })
          .catch(err => res.status(500).json({ message: err }));
      }
    });
});

router.get('/post/:id', (req, res) => {
  BlogPost
  .findById(req.params.id)
  .then(post => res.json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
  });
});

router.post('/post', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
  .then(blogPost => res.status(201).json(blogPost.serialize()))
  .catch(err => {
    res.status(500).json({error: 'something is wrong'});
  });
});

router.put('/post/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `request path id (${req.params.id}) and request body id ` + `(${req.body.id}) must match`;
    console.error(message);
      return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateFields = ['title', 'content', 'author', 'publishDate'];

  updateFields.forEach (field => {
    if (field in req.body) {
      toUpdate[field] = req.body [field];
    }
  });
  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({message: 'somthing not right'}));
});

router.delete('/post/:id', (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id)
  .then(post => res.sendStatus(204).end())
  .catch(err => res.status(500).json({message: "Internal server error"}));
});

router.use('*', function (req, res) {
  res.status(404).json({message: 'Not found'});
});



module.exports = router;