require "net/ftp"
require 'jammit'
# require "octopi"
# include Octopi

module Jammit
  class Compressor
    def construct_asset_path(asset_path, css_path, variant)      
      asset_path
    end      
  end
end

# puts "Packaging files ..."
# FileUtils.rm_r 'public'
# Jammit.package!
# puts "Complete"
# exit



host = "webpublish.its.unimelb.edu.au"
@base_remote_path = "/brand.unimelb.edu.au/web-templates"
# @remote_css_path = "css"
# @remote_images_path = "css"
# @remote_fonts_path = "css"

@css_path = "./css/*.css"
@js_path = "./js/*.js"
@lib_path = "./lib/*.js"
@standard_lib_path = "./lib/standard/*.js"
@images_path = "./images/*.{png,gif,jpg,jpeg}"
@bg_images_path = "./images/backgrounds/*.{png,gif,jpg,jpeg}"
@fonts_path = "./fonts/*.{ttf,woff,eot,svg}"

DEPLOY_TAG = "1"
DEPLOY_EDGE = "2"

# class Test
#   include Octopi
#   authenticated do 
#     # github_username
#     repo = Repository.find
#     puts repo
#   end
# 
# end
# exit


def upload_file(version, type, file_path)
  @ftp.chdir(@base_remote_path)  
  remote_file_name = File.join(@base_remote_path, version, type, File.basename(file_path))
  puts "Uploading #{File.basename(file_path)} to #{remote_file_name}"
  @ftp.putbinaryfile(file_path, remote_file_name)
end


def upload_dir(version, type, path)
  @ftp.chdir(@base_remote_path)
  Dir.glob(path) do |file_name|     
    remote_file_name = File.join(@base_remote_path, version, type, File.basename(file_name))
    puts "Uploading #{File.basename(file_name)} to #{remote_file_name}"
    @ftp.putbinaryfile(file_name, remote_file_name)
  end   
end


def upload_directory(version, local_path, remote_path)
  @ftp.chdir(@base_remote_path)
  Dir.glob(local_path) do |file_name|     
    remote_file_name = File.join(@base_remote_path, version, remote_path, File.basename(file_name))
    puts "Uploading #{File.basename(file_name)} to #{remote_file_name}"
    @ftp.putbinaryfile(file_name, remote_file_name)
  end   
end


def check_versions(ftp)
  
  puts "Checking versions ... "
  
  versions = []
  # ftp.chdir(@base_remote_path)
  ftp.list do |name|        
    if name.index("d") == 0
      versions << name.split(" ").last      
    end    
  end

  versions.delete(".")
  versions.delete("..")  
  versions.delete("EDGE")
  versions.sort
end

def prepare_version(version)
  @ftp.mkdir(version)  
  @ftp.mkdir(File.join(version, "css"))  
  @ftp.mkdir(File.join(version, "images"))   
  @ftp.mkdir(File.join(version, "images", "backgrounds"))   
  @ftp.mkdir(File.join(version, "fonts"))    
  @ftp.mkdir(File.join(version, "js"))
  @ftp.mkdir(File.join(version, "lib"))
  @ftp.mkdir(File.join(version, "lib", "standard"))
end

  
  
def deploy(version)
  
  puts "Deploying #{version} ..."
    
  upload_directory(version, @css_path, "css")
  upload_directory(version, @images_path, "images")
  upload_directory(version, @bg_images_path, "images/backgrounds")
  upload_directory(version, @fonts_path, "fonts")
  upload_directory(version, @js_path, "js")
  upload_directory(version, @lib_path, "lib")
  upload_directory(version, @standard_lib_path, "lib/standard")
   
  upload_file(version, "js", "public/package/complete.js")
  upload_file(version, "css", "public/package/complete.css")

  puts "#{version} deployed"
end


Net::FTP.open(host) do |ftp|
  @ftp = ftp
  
  puts "========================================================"
  puts 
  puts "**  WARNING: you are about to deploy to the Web Farm  **"
  puts 
  puts "========================================================"
  print "Are you sure? (y/n): "  
  confirm = gets.strip.downcase
  
  exit unless confirm == "y"
  
  print "Username: "
  username = gets 
  
  print "Password: "
  password = gets
    
  ftp.login(username,password)
  ftp.chdir(@base_remote_path)
  
  
  puts "Connected to #{host} as #{username}"
  versions = check_versions(ftp)
  
  puts "Packaging files ..."
  FileUtils.rm_r 'public'
  Jammit.package!
  puts "Complete"
  
  
  puts "Currently deployed:"  

  puts "--------------------------------------------------------"
  puts versions
  puts "--------------------------------------------------------"  

  print "Deploy Tag: "
  version = gets.strip.downcase

  begin
  prepare_version("EDGE") #unless versions.include?("EDGE") 
  rescue
  end
  
  if versions.include?(version)  
    print "Tag already exists on server. Are you sure (y/n): "  
    deploy = gets.strip.downcase
    exit unless deploy == "y"    
  else
    prepare_version(version)            
  end

  if version.split("-").length == 3
    wildcard_version = version.split("-").first(2).join("-")
    print "Deploy this tag to #{wildcard_version}? (y/n): "  
    deploy_wildcard = gets.strip.downcase    
    
    unless versions.include?(wildcard_version) 
      prepare_version(wildcard_version)
    end
    
  end
  
  
  if (versions.last == version || !versions.include?(version))  && version != "EDGE"
    print "Deploy this tag to EDGE? (y/n): "  
    edge = gets.strip.downcase
  end
  


  deploy(version)
  deploy(wildcard_version) if deploy_wildcard == "y"
  deploy("EDGE") if edge == "y"
    
  ftp.close
  
  puts "========================================================"
  puts 
  puts "#{version} deployed to #{host}"
  puts 
  puts "========================================================"
  
end