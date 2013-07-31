css_dir = "css"
sass_dir = "sass"
images_dir = "images"
javascripts_dir = "js"

output_style = :nested
#output_style = :compressed
environment = :development
#environment = :production

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false
color_output = true


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass

if environment != :production
  sass_options = {:debug_info => true}
end