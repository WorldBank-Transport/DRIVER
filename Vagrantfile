# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 1.5"
require "yaml"

def testing?
  !ENV["DRIVER_ENV"].nil? && ENV["DRIVER_ENV"] == "TEST"
end

# Deserialize Ansible Galaxy installation metadata for a role
def galaxy_install_info(role_name)
  role_path = File.join("deployment", "ansible", "roles", role_name)
  galaxy_install_info = File.join(role_path, "meta", ".galaxy_install_info")

  if (File.directory?(role_path) || File.symlink?(role_path)) && File.exists?(galaxy_install_info)
    YAML.load_file(galaxy_install_info)
  else
    { install_date: "", version: "0.0.0" }
  end
end

# Uses the contents of roles.txt to ensure that ansible-galaxy is run
# if any dependencies are missing
def install_dependent_roles
  ansible_directory = File.join("deployment", "ansible")
  ansible_roles_txt = File.join(ansible_directory, "roles.txt")

  File.foreach(ansible_roles_txt) do |line|
    role_name, role_version = line.split(",")
    role_path = File.join(ansible_directory, "roles", role_name)
    galaxy_metadata = galaxy_install_info(role_name)

    if galaxy_metadata["version"] != role_version.strip
      unless system("ansible-galaxy install -f -r #{ansible_roles_txt} -p #{File.dirname(role_path)}")
        $stderr.puts "\nERROR: An attempt to install Ansible role dependencies failed."
        exit(1)
      end

      break
    end
  end
end

# Install missing role dependencies based on the contents of roles.txt
if [ "up", "provision" ].include?(ARGV.first)
  install_dependent_roles
end

if !ENV["VAGRANT_ENV"].nil? && ENV["VAGRANT_ENV"] == "TEST"
  ANSIBLE_ENV_GROUPS = {
    "test:children" => [
      "app-servers",
      "database-servers"
    ]
  }
  VAGRANT_NETWORK_OPTIONS = { auto_correct: true }
else
  ANSIBLE_ENV_GROUPS = {
    "development:children" => [
      "app-servers",
      "database-servers"
    ]
  }
  VAGRANT_NETWORK_OPTIONS = { auto_correct: false }
end

ANSIBLE_GROUPS = {
  "app-servers" => [ "app" ],
  "database-servers" => [ "database" ]
}

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = false
  config.hostmanager.ignore_private_ip = false
  config.hostmanager.include_offline = true

  # Wire up package caching:
  if Vagrant.has_plugin?("vagrant-cachier")
    config.cache.scope = :machine
    config.cache.synced_folder_opts = {
      type: :nfs
    }
  end

  config.vm.define "database" do |database|
    database.vm.hostname = "database"
    database.hostmanager.aliases = %w(database.service.driver.internal)
    database.vm.network "private_network", ip: "192.168.11.101"

    database.vm.synced_folder ".", "/vagrant", disabled: true

    database.vm.provision "ansible" do |ansible|
      ansible.playbook = "deployment/ansible/database.yml"
      ansible.groups = ANSIBLE_GROUPS.merge(ANSIBLE_ENV_GROUPS)
      ansible.raw_arguments = ["--timeout=60"]
    end

    database.ssh.forward_x11 = true

    database.vm.provider :virtualbox do |v|
      v.memory = ENV.fetch("DRIVER_DATABASE_MEM", 2048)
      v.cpus = ENV.fetch("DRIVER_DATABASE_CPU", 2)
    end
  end

  config.vm.define "app" do |app|
    app.vm.hostname = "app"
    app.hostmanager.aliases = %w(app.service.driver.internal)
    app.vm.network "private_network", ip: "192.168.11.102"

    app.vm.synced_folder ".", "/vagrant", disabled: true

    if testing?
        app.vm.synced_folder "./app", "/opt/app"
        web.vm.synced_folder "./web", "/opt/web"
        app.vm.synced_folder "./schema_editor", "/opt/schema"
        #TODO, this probably won't work:
        app.vm.synced_folder "../ashlar", "/opt/ashlar"
    else
        app.vm.synced_folder "./app", "/opt/app", :nfs => true
        app.vm.synced_folder "./web", "/opt/web", :nfs => true
        app.vm.synced_folder "./schema_editor", "/opt/schema", :nfs => true
        app.vm.synced_folder "../ashlar", "/opt/ashlar", :nfs => true
        # Mount options causing some users trouble, disable until necessary (e.g. a grunt/gulp install)
        #app.vm.synced_folder "./app", "/opt/app", :nfs => true, :mount_options => [
            #("nfsvers=3" if ENV.fetch("DRIVER_NFS_VERSION_3", false)),
            #"noatime",
            #"actimeo=1",
        #]
    end

    # nginx
    app.vm.network "forwarded_port", guest: 80, host: Integer(ENV.fetch("DRIVER_WEB_PORT_80", 7000))
    # Runserver
    app.vm.network "forwarded_port", guest: 4000, host: Integer(ENV.fetch("DRIVER_DJANGO_PORT_3000", 3000))
    # Grunt serve - schema editor
    app.vm.network "forwarded_port", guest: 9000, host: Integer(ENV.fetch("DRIVER_GRUNT_PORT_7001", 7001))
    # Grunt serve - web app 
    app.vm.network "forwarded_port", guest: 9001, host: Integer(ENV.fetch("DRIVER_GRUNT_PORT_7002", 7002))
    # editor livereload
    app.vm.network "forwarded_port", guest: 35731, host: 35731
    # web livereload
    app.vm.network "forwarded_port", guest: 35732, host: 35732

    app.vm.provision "ansible" do |ansible|
      ansible.playbook = "deployment/ansible/app.yml"
      ansible.groups = ANSIBLE_GROUPS.merge(ANSIBLE_ENV_GROUPS)
      ansible.raw_arguments = ["--timeout=60"]
    end

    app.ssh.forward_x11 = true

    app.vm.provider :virtualbox do |v|
      # TODO: Bump once we're actually using this machine
      v.memory = ENV.fetch("DRIVER_APP_MEM", 1024)
      v.cpus = ENV.fetch("DRIVER_APP_CPUS", 1)
    end
  end

end
